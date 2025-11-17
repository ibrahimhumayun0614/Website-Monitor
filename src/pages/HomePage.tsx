import { useEffect, useState, useCallback } from 'react';
import { usePrevious } from 'react-use';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { SiteCard } from '@/components/SiteCard';
import { AddSiteDialog } from '@/components/AddSiteDialog';
import { EmptyState } from '@/components/EmptyState';
import useSitesStore from '@/hooks/use-sites-store';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Loader } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { requestNotificationPermission, showSiteDownNotification, showSiteUpNotification } from '@/lib/notifications';
import type { MonitoredSite } from '@shared/types';
import { SiteCardSkeleton } from '@/components/SiteCardSkeleton';
const REFRESH_INTERVAL = 60000; // 60 seconds
export function HomePage() {
  const sites = useSitesStore((s) => s.sites);
  const isLoading = useSitesStore((s) => s.isLoading);
  const fetchSites = useSitesStore((s) => s.fetchSites);
  const recheckSite = useSitesStore((s) => s.recheckSite);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<MonitoredSite | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const prevSites = usePrevious(sites);
  useEffect(() => {
    fetchSites();
    requestNotificationPermission();
  }, [fetchSites]);
  useEffect(() => {
    if (prevSites && prevSites.length > 0 && sites.length > 0) {
      sites.forEach(currentSite => {
        const previousSite = prevSites.find(s => s.id === currentSite.id);
        if (previousSite) {
          if (previousSite.status === 'UP' && currentSite.status === 'DOWN') {
            showSiteDownNotification(currentSite.name);
          } else if (previousSite.status === 'DOWN' && currentSite.status === 'UP') {
            showSiteUpNotification(currentSite.name);
          }
        }
      });
    }
  }, [sites, prevSites]);
  const stableRecheckSite = useCallback(recheckSite, [recheckSite]);
  useEffect(() => {
    if (sites.length > 0) {
      const interval = setInterval(() => {
        sites.forEach(site => {
          stableRecheckSite(site.id);
        });
      }, REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [sites, stableRecheckSite]);
  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    await Promise.all(sites.map(site => recheckSite(site.id)));
    setIsRefreshingAll(false);
  };
  const handleAddSiteClick = () => {
    setEditingSite(null);
    setIsDialogOpen(true);
  };
  const handleEditSiteClick = (site: MonitoredSite) => {
    setEditingSite(site);
    setIsDialogOpen(true);
  };
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SiteCardSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (sites.length === 0) {
      return <EmptyState onAddSite={handleAddSiteClick} />;
    }
    return (
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {sites.map((site) => (
            <motion.div
              key={site.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <SiteCard site={site} onEdit={handleEditSiteClick} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };
  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
        <ThemeToggle className="fixed top-4 right-4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <header className="flex flex-wrap items-center justify-between gap-4 mb-8 md:mb-12">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600" />
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Zenith Watch
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {sites.length > 0 && (
                  <Button variant="outline" onClick={handleRefreshAll} disabled={isRefreshingAll}>
                    {isRefreshingAll ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh All
                  </Button>
                )}
                <Button onClick={handleAddSiteClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Site
                </Button>
              </div>
            </header>
            <main>{renderContent()}</main>
          </div>
        </div>
      </div>
      <AddSiteDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} siteToEdit={editingSite} />
      <Toaster richColors closeButton theme="light" />
    </>
  );
}