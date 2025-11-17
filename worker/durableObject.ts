import { DurableObject } from "cloudflare:workers";
import type { DemoItem, MonitoredSite, SiteStatus } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
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
    // Zenith Watch Methods
    async getSites(): Promise<MonitoredSite[]> {
        const sites = await this.ctx.storage.get<MonitoredSite[]>("monitored_sites");
        return sites || [];
    }
    async checkSite(site: MonitoredSite): Promise<MonitoredSite> {
        const startTime = Date.now();
        let status: SiteStatus = 'DOWN';
        let responseTime: number | null = null;
        try {
            const response = await fetch(site.url, { method: 'HEAD', redirect: 'follow' });
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
            ...site,
            status,
            responseTime,
            lastChecked: new Date().toISOString(),
        };
    }
    async addSite(url: string): Promise<MonitoredSite[]> {
        const sites = await this.getSites();
        if (sites.find(s => s.url === url)) {
            return sites;
        }
        let newSite: MonitoredSite = {
            id: crypto.randomUUID(),
            url,
            status: 'CHECKING',
            responseTime: null,
            lastChecked: null,
        };
        newSite = await this.checkSite(newSite);
        const updatedSites = [...sites, newSite];
        await this.ctx.storage.put("monitored_sites", updatedSites);
        return updatedSites;
    }
    async deleteSite(id: string): Promise<MonitoredSite[]> {
        const sites = await this.getSites();
        const updatedSites = sites.filter(site => site.id !== id);
        await this.ctx.storage.put("monitored_sites", updatedSites);
        return updatedSites;
    }
}