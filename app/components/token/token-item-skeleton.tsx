import { Skeleton } from "@flarekit/ui/components/ui/skeleton"

export function TokenItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2 flex-1">
        {/* Token Name */}
        <Skeleton className="h-5 w-32" />

        {/* Token Value */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="size-8 rounded-md" />
        </div>

        {/* Token Details */}
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}
