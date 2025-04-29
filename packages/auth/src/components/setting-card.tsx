import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
} from "@flarekit/ui/components/ui/card";
import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { cn } from "@flarekit/ui/lib/utils";
import type { ReactNode } from "react";
import SettingCardHeader from "./setting-card-header";

interface SettingCardProps extends React.ComponentProps<"div"> {
  className?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  variant?: "default" | "destructive";
  instructions?: ReactNode;
  action?: ReactNode;
  isPending?: boolean;
}

export default function SettingCard({
  className,
  title,
  description,
  children,
  variant,
  isPending,
  instructions,
  action,
}: SettingCardProps) {
  return (
    <Card
      className={cn(
        "w-full  text-start py-6 pb-0",
        variant === "destructive" ? "border-destructive/30" : "",
        className,
      )}
    >
      <SettingCardHeader
        variant={variant}
        title={title}
        description={description}
        isPending={isPending}
      />
      {children && <CardContent>{children}</CardContent>}
      {action || instructions ? (
        <CardFooter
          className={cn(
            "flex  md:flex-row  flex-col md:justify-between rounded-b-xl gap-4 items-start",
            (action || instructions) && "!py-4 border-t",
            variant === "destructive"
              ? "bg-destructive/10 border-destructive/30"
              : "bg-muted dark:bg-transparent",
          )}
        >
          {isPending ? (
            <>
              <Skeleton className="mt-1.5 mb-0.5 h-1 w-2/5 md:h-3.5" />
              <Skeleton className="h-9 w-24 self-end" />
            </>
          ) : (
            <>
              <CardDescription className="text-muted-foreground text-xs md:text-sm">
                {instructions}
              </CardDescription>
              <CardAction className="self-end">{action}</CardAction>
            </>
          )}
        </CardFooter>
      ) : (
        <CardFooter className="!pt-0" />
      )}
    </Card>
  );
}
