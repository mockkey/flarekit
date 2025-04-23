import { Skeleton } from "@flarekit/ui/components/ui/skeleton";

export function TokenItemSkeleton() {
  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-20" />
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Token Details */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
