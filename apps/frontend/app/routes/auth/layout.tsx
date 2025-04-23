import { AuthProvider } from "@flarekit/auth/lib/auth-provider";
import { Button } from "@flarekit/ui/components/ui/button";
import { RiGithubFill } from "@remixicon/react";
import { ArrowLeft } from "lucide-react";
import { Link, NavLink, Outlet, redirect } from "react-router";
import { serverAuth } from "~/features/auth/server/auth";
import type { Route } from "./+types/layout";

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = serverAuth(context.cloudflare.env);
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session && session.user.emailVerified === true) {
    throw redirect("/dashboard");
  }

  return { session };
}

export default function Layout() {
  return (
    <div className="flex flex-col bg-muted min-h-svh">
      <header className="h-[65px] container flex felx-col w-full mx-auto items-center">
        <Link to={"/"}>
          <Button className="cursor-pointer" variant={"ghost"}>
            <ArrowLeft />
            Back
          </Button>
        </Link>
      </header>
      <div className="container flex flex-1 flex-col items-center justify-center gap-6  p-6 md:p-10 mx-auto">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground" />
            Sass Inc.
          </a>
          <AuthProvider
            socials={[
              {
                name: "github",
                icon: <RiGithubFill size={32} />,
                label: "Continue with Github",
              },
            ]}
            Link={({ href, ...props }) => <NavLink to={href!} {...props} />}
          >
            <Outlet />
          </AuthProvider>
        </div>
      </div>
    </div>
  );
}
