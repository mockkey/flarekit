import { Button } from "@flarekit/ui/components/ui/button";
import { RiSparklingFill } from "@remixicon/react";
import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className=" fixed z-50 w-full h-16 border-b bg-white/80 dark:bg-black/80 backdrop-blur-sm px-4">
        <nav className="h-full container mx-auto flex justify-between items-center">
          <Link to={"/"}>
            <h1 className="text-xl font-bold flex flex-row gap-x-2">
              <RiSparklingFill className="text-primary size-8" />
              Flare Kit
            </h1>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="https://github.com/mockkey/flarekit" target="_blank">
              <Button variant={"link"}>GitHub</Button>
            </Link>
            <Link to="/auth/sign-in">
              <Button className="cursor-pointer">Sign in</Button>
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
