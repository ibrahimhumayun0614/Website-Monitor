import { MonitoredSite, SiteStatus } from '@shared/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Globe, Loader, MoreVertical, Trash2, XCircle, LineChart as LineChartIcon, User, Calendar, ExternalLink, Pencil, Clock, Mail, RefreshCw, Settings2, FileJson2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { formatDistanceToNow } from 'date-fns';
interface SiteCardProps {
  site: MonitoredSite;
  onEdit: (site: MonitoredSite) => void;
}
const statusConfig: Record<SiteStatus, { label: string; icon: React.ElementType; className: string }> = {
  UP: { label: 'Up', icon: CheckCircle2, className: 'bg-green-100 text-green-800 border-green-200' },
  DOWN: { label: 'Down', icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200' },
  DEGRADED: { label: 'Degraded', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  CHECKING: { label: 'Checking...', icon: Loader, className: 'bg-slate-100 text-slate-800 border-slate-200 animate-pulse' },
};
export function SiteCard({ site, onEdit }: SiteCardProps) {
  const removeSite = useSitesStore((s) => s.removeSite);
  const recheckSite = useSitesStore((s) => s.recheckSite);
  const { label, icon: Icon, className } = statusConfig[site.status];
  const formattedUrl = site.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const chartData = site.history
    .map(h => ({
      time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responseTime: h.responseTime,
    }))
    .reverse();
  const SiteInfo = () => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold truncate" title={site.name}>{site.name}</p>
          <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-base text-muted-foreground hover:underline flex items-center gap-1.5" title={site.url}>
            <span className="truncate">{formattedUrl}</span> <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
  const StatusBadge = () => (
    <Badge variant="outline" className={cn("text-xs w-full justify-center sm:w-auto", className)}>
      <Icon className={cn("h-3 w-3 mr-1.5", site.status === 'CHECKING' && 'animate-spin')} />
      {label}
    </Badge>
  );
  const ResponseTime = () => (
    <div className="text-center">
      {site.status !== 'CHECKING' && site.responseTime !== null ? (
        <p className="text-sm"><span className="font-bold text-foreground">{site.responseTime}</span> ms</p>
      ) : <div className="h-5 w-12 mx-auto" />}
    </div>
  );
  const PerformanceChart = () => (
    <div className="relative h-24 w-full">
      {site.isRechecking && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {site.history && site.history.length > 1 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={"rgba(0, 0, 0, 0.1)"} />
            <XAxis dataKey="time" stroke={"#64748b"} fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
                padding: '4px 8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line type="monotone" dataKey="responseTime" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={site.status === 'UP'} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2 h-full">
          <LineChartIcon className="h-5 w-5" />
          <span>Awaiting more data for chart.</span>
        </div>
      )}
    </div>
  );
  const Metadata = () => (
    <div className="text-sm text-muted-foreground space-y-1.5">
      {site.maintainer && (
        <div className="flex items-center gap-2 truncate">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Maintained by: <span className="font-medium text-foreground">{site.maintainer}</span></span>
        </div>
      )}
      {site.domainExpiry && (
        <div className="flex items-center gap-2 truncate">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Expires in {formatDistanceToNow(new Date(site.domainExpiry), { addSuffix: true })}</span>
        </div>
      )}
       {site.lastChecked && (
        <div className="flex items-center gap-2 truncate">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Checked {formatDistanceToNow(new Date(site.lastChecked), { addSuffix: true })}</span>
        </div>
      )}
      {site.notificationEmail && (
        <div className="flex items-center gap-2 truncate">
          <Mail className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Alerts to: <span className="font-medium text-foreground">{site.notificationEmail}</span></span>
        </div>
      )}
      {site.httpMethod && site.httpMethod !== 'HEAD' && (
        <div className="flex items-center gap-2 truncate">
          <Settings2 className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Method: <span className="font-medium text-foreground">{site.httpMethod}</span></span>
        </div>
      )}
      {site.httpHeaders && Object.keys(site.httpHeaders).length > 0 && (
        <div className="flex items-center gap-2 truncate">
          <FileJson2 className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Using custom headers</span>
        </div>
      )}
    </div>
  );
  const ActionsMenu = () => (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(site)}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Re-check</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50" onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to manually trigger a new status check for "{site.name}"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => recheckSite(site.id)}>
            Yes, Re-check
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  const hasMetadata = site.maintainer || site.domainExpiry || site.notificationEmail || site.lastChecked || (site.httpMethod && site.httpMethod !== 'HEAD') || (site.httpHeaders && Object.keys(site.httpHeaders).length > 0);
  return (
    <Card className="p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-4">
        <SiteInfo />
        <ActionsMenu />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 p-3 rounded-md bg-background/50">
          <p className="text-xs text-muted-foreground font-medium">Status</p>
          <StatusBadge />
        </div>
        <div className="flex flex-col gap-2 p-3 rounded-md bg-background/50">
          <p className="text-xs text-muted-foreground font-medium">Response Time</p>
          <ResponseTime />
        </div>
      </div>
      <div className="p-3 rounded-md bg-background/50 flex-1">
        <p className="text-xs text-muted-foreground font-medium mb-2">Performance</p>
        <PerformanceChart />
      </div>
      {hasMetadata && (
        <div className="p-3 rounded-md bg-background/50">
          <Metadata />
        </div>
      )}
    </Card>
  );
}