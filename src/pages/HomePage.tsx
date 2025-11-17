import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { SiteCard } from '@/components/SiteCard';
import { AddSiteDialog } from '@/components/AddSiteDialog';
import { EmptyState } from '@/components/EmptyState';
import useSitesStore from '@/hooks/use-sites-store';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Loader } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
const REFRESH_INTERVAL = 60000; // 60 seconds
export function HomePage() {
  const sites = useSitesStore((s) => s.sites);
  const isLoading = useSitesStore((s) => s.isLoading);
  const fetchSites = useSitesStore((s) => s.fetchSites);
  const recheckSite = useSitesStore((s) => s.recheckSite);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);
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
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 p-4 border rounded-xl">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-[120px] w-full rounded-lg" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (sites.length === 0) {
      return <EmptyState onAddSite={() => setIsAddDialogOpen(true)} />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {sites.map((site) => (
            <motion.div
              key={site.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <SiteCard site={site} />
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
            <header className="flex items-center justify-between mb-8 md:mb-12">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600" />
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Zenith Watch
                </h1>
              </div>
              <div className="flex items-center gap-2">
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
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Site
                </Button>
              </div>
            </header>
            <main>{renderContent()}</main>
          </div>
        </div>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          Built with ❤️ at Cloudflare
        </footer>
      </div>
      <AddSiteDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <Toaster richColors closeButton theme="light" />
    </>
  );
}