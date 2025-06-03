import { formatBytes } from "@flarekit/common/utils";
import { Button } from "@flarekit/ui/components/ui/button";
import { Progress } from "@flarekit/ui/components/ui/progress";
import { cn } from "@flarekit/ui/lib/utils";
import { RiFlashlightLine, RiHardDrive2Line } from "@remixicon/react";
import { useStorage } from "./hooks/use-file-manager";

export default function StorageUsage() {
  const { data: storage, isPending } = useStorage();
  const percentage = Math.min(
    ((storage?.usedStorage || 0) / (storage?.totalStorage || 1)) * 100,
    100,
  );
  const isNearLimit = percentage > 80;

  return (
    <div className="px-3 py-4">
      <div className="rounded-lg bg-muted/30 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <RiHardDrive2Line
            className={cn(
              "size-4",
              isPending
                ? "text-muted/50 animate-pulse"
                : "text-muted-foreground",
            )}
          />
          <span
            className={cn("text-xs font-medium", isPending && "text-muted/50")}
          >
            Storage
          </span>
          {storage?.isPro && (
            <span
              className={cn(
                "ml-auto text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full",
                isPending && "bg-muted/20 text-muted/50",
              )}
            >
              PRO
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            {isPending ? (
              <>
                <div className="h-3 w-12 bg-muted/20 rounded animate-pulse" />
                <div className="h-3 w-12 bg-muted/20 rounded animate-pulse" />
              </>
            ) : (
              <>
                <span className="text-muted-foreground">
                  {formatBytes(storage?.usedStorage)} used
                </span>
                <span className="text-muted-foreground">
                  {formatBytes(storage?.totalStorage)}
                </span>
              </>
            )}
          </div>
          <Progress
            value={isPending ? undefined : percentage}
            className={cn(
              "h-1.5",
              isPending && "animate-pulse",
              `[&>[role=progressbar]]:${
                percentage > 90
                  ? "bg-destructive"
                  : percentage > 80
                    ? "bg-warning"
                    : "bg-primary"
              }`,
            )}
          />
        </div>
        {!storage?.isPro && isNearLimit && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            className={cn(
              "w-full h-8 text-xs bg-primary/5 hover:bg-primary/10",
              isPending && "opacity-50",
            )}
          >
            <RiFlashlightLine className="mr-1.5 size-3.5" />
            Upgrade to Pro
          </Button>
        )}
      </div>
    </div>
  );
}
