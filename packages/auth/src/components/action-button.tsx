import { Spinner } from "@flarekit/ui/components/spinner";
import { Button } from "@flarekit/ui/components/ui/button";
import { cn } from "@flarekit/ui/lib/utils";
import React from "react";
import { useFormStatus } from "react-dom";

interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    React.RefAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  label?: string;
  asChild?: boolean;
}

export const ActionButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>(({ className, isLoading, label, children, ...props }, ref) => {
  const { pending } = useFormStatus();
  return (
    <Button
      className={cn("w-full", className)}
      ref={ref}
      disabled={isLoading || pending || props.disabled}
      {...props}
    >
      {isLoading || pending ? (
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" />
          <span>{label || "Loading..."}</span>
        </div>
      ) : (
        children || label
      )}
    </Button>
  );
});

ActionButton.displayName = "ActionButton";
