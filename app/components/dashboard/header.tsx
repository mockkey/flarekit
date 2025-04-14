import { Button } from "@flarekit/ui/components/ui/button";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "@remixicon/react";
import UserNav from "./user-nav";
import { User } from "better-auth";
import { useSidebar } from "@flarekit/ui/components/ui/sidebar";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const { toggleSidebar, open } = useSidebar();
  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-white dark:bg-slate-950 px-4">
      <div className="flex h-full items-center justify-between">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {open ? (
            <RiMenuFoldLine className="size-5" />
          ) : (
            <RiMenuUnfoldLine className="size-5" />
          )}
        </Button>
        <UserNav user={user} />
      </div>
    </header>
  );
}
