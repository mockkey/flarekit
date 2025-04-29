import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { cn } from "@flarekit/ui/lib/utils";

interface SettingCardHeaderProps {
  variant?: "default" | "destructive";
  className?: string;
  title: string;
  description: string;
  isPending?: boolean;
}

export default function SettingCardHeader({
  variant,
  className,
  title,
  description,
  isPending,
}: SettingCardHeaderProps) {
  return (
    <CardHeader className={className}>
      {isPending ? (
        <>
          <Skeleton className="h-4 w-1/3 md:h-4" />
          {description && <Skeleton className="mt-1.5  h-3 w-2/3 md:h-3.5" />}
        </>
      ) : (
        <>
          <CardTitle
            className={cn(variant === "destructive" ? "text-destructive" : "")}
          >
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </>
      )}
    </CardHeader>
  );
}
