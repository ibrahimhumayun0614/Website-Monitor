import { MonitoredSite, SiteStatus } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Globe, Loader, MoreVertical, Trash2, XCircle, LineChart as LineChartIcon } from 'lucide-react';
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
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '@/hooks/use-theme';
interface SiteCardProps {
  site: MonitoredSite;
}
const statusConfig: Record<SiteStatus, { label: string; icon: React.ElementType; className: string }> = {
  UP: { label: 'Up', icon: CheckCircle2, className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800' },
  DOWN: { label: 'Down', icon: XCircle, className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800' },
  DEGRADED: { label: 'Degraded', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  CHECKING: { label: 'Checking...', icon: Loader, className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 animate-pulse' },
};
export function SiteCard({ site }: SiteCardProps) {
  const removeSite = useSitesStore((s) => s.removeSite);
  const { isDark } = useTheme();
  const { label, icon: Icon, className } = statusConfig[site.status];
  const formattedUrl = site.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const chartData = site.history
    .map(h => ({
      time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responseTime: h.responseTime,
    }))
    .reverse();
  return (
    <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div className="space-y-1.5 overflow-hidden">
          <CardTitle className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
      <CardContent className="flex-grow flex items-center justify-center py-4 min-h-[120px]">
        {site.history && site.history.length > 1 ? (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} />
              <XAxis dataKey="time" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? 'hsl(var(--background))' : 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line type="monotone" dataKey="responseTime" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <LineChartIcon className="h-6 w-6" />
            <span>Awaiting more data for performance chart.</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-4 flex justify-between items-center">
        <p>Last checked: {site.lastChecked ? new Date(site.lastChecked).toLocaleString() : 'N/A'}</p>
        <div className="text-right">
          {site.status !== 'CHECKING' && site.responseTime !== null ? (
            <p><span className="font-bold text-foreground">{site.responseTime}</span> ms</p>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}