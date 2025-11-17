import { useEffect, useRef } from 'react';
import type { MonitoredSite } from '@shared/types';
import { showSummaryNotification } from '@/lib/notifications';
const NOTIFICATION_TIMES = [
  { hour: 9, minute: 0 },  // 9:00 AM
  { hour: 13, minute: 0 }, // 1:00 PM
  { hour: 16, minute: 30 } // 4:30 PM
];
export function useSummaryNotifications(sites: MonitoredSite[]) {
  const sitesRef = useRef(sites);
  useEffect(() => {
    sitesRef.current = sites;
  }, [sites]);
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    const scheduleNotification = (hour: number, minute: number) => {
      const now = new Date();
      let notificationDate = new Date();
      notificationDate.setHours(hour, minute, 0, 0);
      if (now.getTime() > notificationDate.getTime()) {
        // If time has passed for today, schedule for tomorrow
        notificationDate.setDate(notificationDate.getDate() + 1);
      }
      const delay = notificationDate.getTime() - now.getTime();
      const timer = setTimeout(() => {
        // Check if there are any sites to report on
        if (sitesRef.current.length > 0) {
          showSummaryNotification(sitesRef.current);
        }
        // Reschedule for the next day
        scheduleNotification(hour, minute);
      }, delay);
      timers.push(timer);
    };
    // Set up initial timers for all scheduled times
    NOTIFICATION_TIMES.forEach(({ hour, minute }) => {
      scheduleNotification(hour, minute);
    });
    // Cleanup function to clear all timers when the component unmounts
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount
}