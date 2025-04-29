import { UserNav } from "@flarekit/auth/components/user-nav";
import { Button } from "@flarekit/ui/components/ui/button";
import { useSidebar } from "@flarekit/ui/components/ui/sidebar";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "@remixicon/react";

export default function Header() {
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
        <UserNav />
      </div>
    </header>
  );
}
