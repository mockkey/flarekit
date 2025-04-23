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
  icon?: React.ReactNode;
  name: string;
}

export const SocicalButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>(({ className, isLoading, label, icon, ...props }, ref) => {
  const { pending } = useFormStatus();
  return (
    <Button
      value={"github"}
      variant="outline"
      className={cn("w-full", className)}
      ref={ref}
      disabled={isLoading || pending || props.disabled}
      {...props}
    >
      {icon && icon}
      {isLoading
        ? "Connecting..."
        : `${label ? label : `Continue with ${label} `} `}
    </Button>
  );
});

SocicalButton.displayName = "SocicalButton";
