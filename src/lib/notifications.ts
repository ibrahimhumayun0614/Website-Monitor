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