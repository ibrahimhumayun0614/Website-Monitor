import { PlusCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
type EmptyStateProps = {
  onAddSite: () => void;
};
export function EmptyState({ onAddSite }: EmptyStateProps) {
  return (
    <div className="text-center py-24 px-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed animate-fade-in">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
        <Globe className="h-8 w-8 text-slate-500" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Your Watchlist is Empty
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Start monitoring your first website to see its uptime and performance in real-time.
      </p>
      <Button onClick={onAddSite} size="lg" className="group">
        <PlusCircle className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
        Add Your First Site
      </Button>
    </div>
  );
}