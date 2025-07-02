import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@flarekit/ui/components/ui/context-menu";
import type { ReactNode } from "react";

export interface ContextMenuAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface FileContextMenuProps {
  children: ReactNode;
  actions: ContextMenuAction[];
}

export function FileContextMenu({ children, actions }: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {actions.map((action, index) => (
          <div key={`${action.label}-${index}`}>
            {action.separator && index > 0 && <ContextMenuSeparator />}
            <ContextMenuItem
              onClick={action.onClick}
              className={
                action.variant === "destructive"
                  ? "text-destructive focus:text-destructive"
                  : ""
              }
            >
              {action.label}
            </ContextMenuItem>
          </div>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
