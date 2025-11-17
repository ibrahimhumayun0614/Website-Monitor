export type SiteStatus = 'UP' | 'DOWN' | 'CHECKING' | 'DEGRADED';
export interface SiteCheck {
  timestamp: string;
  responseTime: number | null;
  status: SiteStatus;
}
export interface MonitoredSite {
  id: string;
  url: string;
  name: string;
  domainExpiry?: string;
  maintainer?: string;
  notificationEmail?: string;
  httpMethod?: 'HEAD' | 'GET';
  httpHeaders?: Record<string, string>;
  status: SiteStatus;
  responseTime: number | null;
  lastChecked: string | null;
  history: SiteCheck[];
  isRechecking?: boolean;
}
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}