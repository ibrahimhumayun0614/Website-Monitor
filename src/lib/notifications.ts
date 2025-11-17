import type { MonitoredSite } from '@shared/types';
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
};
export const showSiteDownNotification = (siteName: string): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  const notification = new Notification('Website Monitor Tool - Site Down Alert', {
    body: `Your monitored site "${siteName}" is currently down.`,
    icon: '/favicon.ico', // Assuming a favicon exists at the root
    silent: false,
  });
  notification.onclick = () => {
    window.focus();
  };
};
export const showSiteUpNotification = (siteName: string): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  const notification = new Notification('Website Monitor Tool - Site Up Alert', {
    body: `Your monitored site "${siteName}" is back up!`,
    icon: '/favicon.ico',
    silent: false,
  });
  notification.onclick = () => {
    window.focus();
  };
};
export const showSummaryNotification = (sites: MonitoredSite[]): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  const upCount = sites.filter(s => s.status === 'UP').length;
  const downCount = sites.filter(s => s.status === 'DOWN').length;
  const degradedCount = sites.filter(s => s.status === 'DEGRADED').length;
  let body = '';
  if (downCount === 0 && degradedCount === 0) {
    body = `All ${upCount} monitored sites are currently UP.`;
  } else {
    const parts = [];
    if (upCount > 0) parts.push(`${upCount} site${upCount > 1 ? 's' : ''} UP`);
    if (downCount > 0) parts.push(`${downCount} site${downCount > 1 ? 's' : ''} DOWN`);
    if (degradedCount > 0) parts.push(`${degradedCount} site${degradedCount > 1 ? 's' : ''} DEGRADED`);
    body = `Monitoring Summary: ${parts.join(', ')}.`;
  }
  const notification = new Notification('Website Monitor Tool - Daily Summary', {
    body,
    icon: '/favicon.ico',
    silent: true, // Summaries are less urgent, so make them silent
  });
  notification.onclick = () => {
    window.focus();
  };
};