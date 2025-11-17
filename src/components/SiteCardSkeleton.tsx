import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
export function SiteCardSkeleton() {
  return (
    <Card className="p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-12 w-full rounded-md" />
    </Card>
  );
}