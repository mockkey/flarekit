import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { cn } from "@flarekit/ui/lib/utils";
import type { ReactNode } from "react";

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
        "w-full  text-start pb-0",
        variant === "destructive" ? "border-destructive/30" : "",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      {(action || instructions) && (
        <CardFooter
          className={cn(
            "flex  md:flex-row  flex-col justify-between rounded-b-xl gap-4",
            (action || instructions) && "!py-4 border-t",
            variant === "destructive"
              ? "bg-destructive/10 border-destructive/30"
              : "bg-muted dark:bg-transparent",
          )}
        >
          <CardDescription className="text-muted-foreground text-xs md:text-sm">
            {instructions}
          </CardDescription>
          {isPending ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <CardAction className="self-end">{action}</CardAction>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
