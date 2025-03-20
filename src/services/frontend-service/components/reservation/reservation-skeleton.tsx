import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function ReservationSkeleton() {
  return (
    <Card className="p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-3 flex-1">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="pt-4 border-t space-y-2 mt-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex flex-wrap gap-2 mt-4 pt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </Card>
  );
}
