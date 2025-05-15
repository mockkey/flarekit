import { AuthProvider } from "@flarekit/auth/lib/auth-provider";
import {
  SidebarInset,
  SidebarProvider,
} from "@flarekit/ui/components/ui/sidebar";
import { RiGithubFill } from "@remixicon/react";
import { useEffect } from "react";
import { NavLink, Outlet, redirect } from "react-router";
import { type Theme, useTheme } from "remix-themes";
import Header from "~/components/dashboard/header";
import SidebarNav from "~/components/dashboard/sidebar-nav";
import { serverAuth } from "~/features/auth/server/auth.server";
import type { ExtendedUser } from "~/features/auth/types";
import type { Route } from "./+types/layout";

export async function loader({ request, context }: Route.LoaderArgs) {
  const auth = serverAuth(context.cloudflare.env);
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/auth/sign-in");
  }
  if (session.user.emailVerified === false) {
    throw redirect("/auth/sign-up/success");
  }
  return session;
}

export default function Layout({ loaderData: { user } }: Route.ComponentProps) {
  const [, setTheme] = useTheme();
  useEffect(() => {
    const themeCurrent = (user as ExtendedUser).theme;
    setTheme(themeCurrent as Theme);
  }, [user]);
  return (
    <SidebarProvider>
      <AuthProvider
        socials={[
          {
            name: "github",
            icon: <RiGithubFill size={32} />,
            label: "Continue with Github",
          },
        ]}
        uploadAvatar={(file) => {
          return new Promise((resolve) => {
            const formData = new FormData();
            formData.append("file", file);
            fetch("/api/auth/avatar", {
              method: "post",
              body: formData,
            })
              .then((res) => {
                return res.json();
              })
              .then((data) => {
                resolve(data.avatar);
              });
          });
        }}
        Link={({ href, ...props }) => <NavLink to={href!} {...props} />}
      >
        <SidebarNav />
        <SidebarInset>
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6 bg-slate-100 dark:bg-slate-900">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </AuthProvider>
    </SidebarProvider>
  );
}
