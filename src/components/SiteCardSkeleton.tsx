import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
export function SiteCardSkeleton() {
  return (
    <Card className="p-4">
      {/* Desktop Skeleton */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="w-1/4 space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="w-[100px]">
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="w-[80px]">
          <Skeleton className="h-5 w-12 mx-auto" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="w-1/4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div>
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      {/* Mobile Skeleton */}
      <div className="lg:hidden flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Card>
  );
}