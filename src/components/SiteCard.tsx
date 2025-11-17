import { MonitoredSite, SiteStatus } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Globe, Loader, MoreVertical, Trash2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import useSitesStore from '@/hooks/use-sites-store';
interface SiteCardProps {
  site: MonitoredSite;
}
const statusConfig: Record<SiteStatus, { label: string; icon: React.ElementType; className: string }> = {
  UP: { label: 'Up', icon: CheckCircle2, className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  DOWN: { label: 'Down', icon: XCircle, className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
  DEGRADED: { label: 'Degraded', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
  CHECKING: { label: 'Checking...', icon: Loader, className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 animate-pulse' },
};
export function SiteCard({ site }: SiteCardProps) {
  const removeSite = useSitesStore((s) => s.removeSite);
  const { label, icon: Icon, className } = statusConfig[site.status];
  const formattedUrl = site.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div className="space-y-1.5">
          <CardTitle className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <a href={site.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate" title={site.url}>
              {formattedUrl}
            </a>
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs", className)}>
            <Icon className={cn("h-3 w-3 mr-1.5", site.status === 'CHECKING' && 'animate-spin')} />
            {label}
          </Badge>
        </div>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this site from your monitoring list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => removeSite(site.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center py-4">
        <div className="text-center text-muted-foreground text-sm">
          {site.status === 'CHECKING' ? (
            'Performing initial check...'
          ) : site.responseTime !== null ? (
            <>
              <span className="text-4xl font-bold text-foreground">{site.responseTime}</span> ms
            </>
          ) : (
            'Response time not available'
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-4">
        <p>Last checked: {site.lastChecked ? new Date(site.lastChecked).toLocaleString() : 'N/A'}</p>
      </CardFooter>
    </Card>
  );
}