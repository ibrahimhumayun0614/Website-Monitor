import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { MonitoredSite } from '@shared/types';
import { toast } from 'sonner';
type NewSitePayload = Omit<MonitoredSite, 'id' | 'status' | 'responseTime' | 'lastChecked' | 'history' | 'isRechecking'>;
type UpdateSitePayload = Partial<NewSitePayload> & { name: string; url: string };
type SitesState = {
  sites: MonitoredSite[];
  isLoading: boolean;
  error: string | null;
};
type SitesActions = {
  fetchSites: () => Promise<void>;
  addSite: (siteData: NewSitePayload) => Promise<void>;
  updateSite: (id: string, siteData: UpdateSitePayload) => Promise<void>;
  removeSite: (id: string) => Promise<void>;
  recheckSite: (id: string) => Promise<void>;
};
const useSitesStore = create<SitesState & SitesActions>()(
  immer((set) => ({
    sites: [],
    isLoading: true,
    error: null,
    fetchSites: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/sites');
        if (!response.ok) throw new Error('Failed to fetch sites.');
        const result = await response.json();
        if (result.success) {
          set({ sites: result.data, isLoading: false });
        } else {
          throw new Error(result.error || 'An unknown error occurred.');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error fetching sites:', errorMessage);
        set({ isLoading: false, error: errorMessage });
        toast.error('Failed to load sites', { description: errorMessage });
      }
    },
    addSite: async (siteData: NewSitePayload) => {
      try {
        const response = await fetch('/api/sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData),
        });
        if (!response.ok) throw new Error('Failed to add site.');
        const result = await response.json();
        if (result.success) {
          set({ sites: result.data });
          toast.success('Site added successfully!', { description: `Now monitoring ${siteData.name}` });
        } else {
          throw new Error(result.error || 'An unknown error occurred.');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error adding site:', errorMessage);
        toast.error('Failed to add site', { description: errorMessage });
      }
    },
    updateSite: async (id: string, siteData: UpdateSitePayload) => {
      try {
        const response = await fetch(`/api/sites/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData),
        });
        if (!response.ok) throw new Error('Failed to update site.');
        const result = await response.json();
        if (result.success) {
          set({ sites: result.data });
          toast.success('Site updated successfully!', { description: `Updated details for ${siteData.name}` });
        } else {
          throw new Error(result.error || 'An unknown error occurred.');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error updating site:', errorMessage);
        toast.error('Failed to update site', { description: errorMessage });
      }
    },
    removeSite: async (id: string) => {
      try {
        const response = await fetch(`/api/sites/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove site.');
        const result = await response.json();
        if (result.success) {
          set({ sites: result.data });
          toast.success('Site removed successfully!');
        } else {
          throw new Error(result.error || 'An unknown error occurred.');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error removing site:', errorMessage);
        toast.error('Failed to remove site', { description: errorMessage });
      }
    },
    recheckSite: async (id: string) => {
      set((state) => {
        const site = state.sites.find((s) => s.id === id);
        if (site) {
          site.isRechecking = true;
        }
      });
      try {
        const response = await fetch(`/api/sites/${id}/recheck`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to re-check site.');
        const result = await response.json();
        if (result.success) {
          set({ sites: result.data });
        } else {
          throw new Error(result.error || 'An unknown error occurred.');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Error re-checking site ${id}:`, errorMessage);
        set((state) => {
          const site = state.sites.find((s) => s.id === id);
          if (site) {
            site.isRechecking = false;
          }
        });
      }
    },
  }))
);
export default useSitesStore;