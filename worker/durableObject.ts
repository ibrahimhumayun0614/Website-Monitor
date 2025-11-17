import { DurableObject } from "cloudflare:workers";
import type { DemoItem, MonitoredSite, SiteStatus, SiteCheck } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
import { sendDowntimeAlert, sendRecoveryAlert } from './email';
const MAX_HISTORY_LENGTH = 24;
type NewSitePayload = {
    url: string;
    name: string;
    domainExpiry?: string;
    maintainer?: string;
    notificationEmail?: string;
    httpMethod?: 'HEAD' | 'GET';
    httpHeaders?: Record<string, string>;
    checkFrequency?: number;
};
type UpdateSitePayload = Partial<NewSitePayload>;
// **DO NOT MODIFY THE CLASS NAME**
export class GlobalDurableObject extends DurableObject {
    // Demo methods - kept for template compatibility
    async getCounterValue(): Promise<number> {
      const value = (await this.ctx.storage.get("counter_value")) || 0;
      return value as number;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async decrement(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value -= amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      if (items) {
        return items as DemoItem[];
      }
      await this.ctx.storage.put("demo_items", MOCK_ITEMS);
      return MOCK_ITEMS;
    }
    async addDemoItem(item: DemoItem): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = [...items, item];
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async updateDemoItem(id: string, updates: Partial<Omit<DemoItem, 'id'>>): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    async deleteDemoItem(id: string): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updatedItems = items.filter(item => item.id !== id);
      await this.ctx.storage.put("demo_items", updatedItems);
      return updatedItems;
    }
    // Website Monitor Tool Methods
    async getSites(): Promise<MonitoredSite[]> {
        const sites = await this.ctx.storage.get<MonitoredSite[]>("monitored_sites");
        return sites || [];
    }
    async checkSite(site: Pick<MonitoredSite, 'url' | 'httpMethod' | 'httpHeaders'>): Promise<SiteCheck> {
        const startTime = Date.now();
        let status: SiteStatus = 'DOWN';
        let responseTime: number | null = null;
        try {
            const fetchOptions: RequestInit = {
                method: site.httpMethod || 'HEAD',
                redirect: 'follow',
                headers: site.httpHeaders || {},
            };
            const response = await fetch(site.url, fetchOptions);
            responseTime = Date.now() - startTime;
            if (response.ok) {
                status = 'UP';
            } else if (response.status >= 400 && response.status < 500) {
                status = 'DEGRADED';
            } else {
                status = 'DOWN';
            }
        } catch (error) {
            console.error(`Error checking ${site.url}:`, error);
            status = 'DOWN';
        }
        return {
            status,
            responseTime,
            timestamp: new Date().toISOString(),
        };
    }
    async addSite(payload: NewSitePayload): Promise<MonitoredSite[]> {
        const sites = await this.getSites();
        if (sites.find(s => s.url === payload.url)) {
            // Site already exists, do not add again.
            return sites;
        }
        const initialCheck = await this.checkSite(payload);
        const newSite: MonitoredSite = {
            id: crypto.randomUUID(),
            ...payload,
            status: initialCheck.status,
            responseTime: initialCheck.responseTime,
            lastChecked: initialCheck.timestamp,
            history: [initialCheck],
        };
        const updatedSites = [...sites, newSite];
        await this.ctx.storage.put("monitored_sites", updatedSites);
        return updatedSites;
    }
    async updateSite(id: string, updates: UpdateSitePayload): Promise<MonitoredSite[]> {
        const sites = await this.getSites();
        const siteIndex = sites.findIndex(s => s.id === id);
        if (siteIndex === -1) {
            return sites; // Site not found
        }
        const originalSite = sites[siteIndex];
        const updatedSite = { ...originalSite, ...updates };
        // If URL or check parameters changed, we should re-check it.
        if (updates.url && updates.url !== originalSite.url || updates.httpMethod !== originalSite.httpMethod || JSON.stringify(updates.httpHeaders) !== JSON.stringify(originalSite.httpHeaders)) {
            const checkResult = await this.checkSite(updatedSite);
            updatedSite.status = checkResult.status;
            updatedSite.responseTime = checkResult.responseTime;
            updatedSite.lastChecked = checkResult.timestamp;
            updatedSite.history = [checkResult]; // Reset history for new URL/params
        }
        const updatedSites = [...sites];
        updatedSites[siteIndex] = updatedSite;
        await this.ctx.storage.put("monitored_sites", updatedSites);
        return updatedSites;
    }
    async deleteSite(id: string): Promise<MonitoredSite[]> {
        const sites = await this.getSites();
        const updatedSites = sites.filter(site => site.id !== id);
        await this.ctx.storage.put("monitored_sites", updatedSites);
        return updatedSites;
    }
    async recheckSite(id: string): Promise<MonitoredSite[]> {
        const sites = await this.getSites();
        const siteIndex = sites.findIndex(s => s.id === id);
        if (siteIndex === -1) {
            // Site not found, maybe it was deleted.
            return sites;
        }
        const siteToCheck = sites[siteIndex];
        const previousStatus = siteToCheck.status;
        const checkResult = await this.checkSite(siteToCheck);
        const updatedSite: MonitoredSite = {
            ...siteToCheck,
            status: checkResult.status,
            responseTime: checkResult.responseTime,
            lastChecked: checkResult.timestamp,
            history: [checkResult, ...siteToCheck.history].slice(0, MAX_HISTORY_LENGTH),
        };
        // Check for status change and send notification
        if (updatedSite.notificationEmail) {
            if (previousStatus !== 'DOWN' && updatedSite.status === 'DOWN') {
                this.ctx.waitUntil(sendDowntimeAlert(updatedSite.name, updatedSite.url, updatedSite.notificationEmail));
            } else if (previousStatus !== 'UP' && updatedSite.status === 'UP') {
                this.ctx.waitUntil(sendRecoveryAlert(updatedSite.name, updatedSite.url, updatedSite.notificationEmail));
            }
        }
        const updatedSites = [...sites];
        updatedSites[siteIndex] = updatedSite;
        await this.ctx.storage.put("monitored_sites", updatedSites);
        return updatedSites;
    }
}