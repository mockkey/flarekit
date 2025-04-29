import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { cn } from "@flarekit/ui/lib/utils";

export function SettingsCellSkeleton() {
  return (
    <div className={cn("flex-row flex")}>
      <div className="flex items-center gap-2">
        <Skeleton className={cn("size-8 rounded-full")} />
        <div>
          <Skeleton className={cn("h-4 w-24")} />
          <Skeleton className={cn("mt-1 h-3 w-36")} />
        </div>
      </div>
      <Skeleton className={cn("ms-auto size-9")} />
    </div>
  );
}
