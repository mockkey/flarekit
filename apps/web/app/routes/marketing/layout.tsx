import { Button } from "@flarekit/ui/components/ui/button";
import { RiSparklingFill } from "@remixicon/react";
import { Link, Outlet } from "react-router";
import Footer from "~/components/marketing/landing/footer";

export default function Layout() {
  return (
    <>
      <header className="h-[65px] border-b  bg-white/80 dark:bg-black/80 px-4">
        <nav className="h-full container mx-auto flex justify-between items-center">
          <Link to={"/"}>
            <h1 className="text-xl font-bold flex flex-row gap-x-2">
              <RiSparklingFill className="text-primary size-8" />
              Flare Kit
            </h1>
          </Link>
          <div className="flex items-center space-x-2">
            <Link to="/docs">
              {" "}
              <Button variant="link">Docs</Button>
            </Link>
            <Link to="https://github.com/mockkey/flarekit" target="_blank">
              <Button variant="link">GitHub</Button>
            </Link>
            <Link to="/auth/sign-in">
              <Button className="cursor-pointer">Sign in</Button>
            </Link>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
