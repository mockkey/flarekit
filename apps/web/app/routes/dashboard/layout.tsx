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

import { SettingService } from "server/services/setting-service";
import type { Route } from "./+types/layout";
export async function loader({ request }: Route.LoaderArgs) {
  const auth = serverAuth();
  const session = await auth.api.getSession({
    headers: request.headers,
    query: {
      disableCookieCache: true,
      disableRefresh: true,
    },
  });

  if (!session) {
    throw redirect("/auth/sign-in");
  }
  //add theme to session
  const theme = await SettingService.getTheme(session.user.id);
  if (session.user.emailVerified === false) {
    const context = await auth.$context;
    const user = await context.internalAdapter.findUserById(session.user.id);
    if (user?.emailVerified === session.user.emailVerified) {
      throw redirect("/auth/sign-up/success");
    }
    //set session
    if (user?.emailVerified === true) {
      session.user.emailVerified = true;
      await context.secondaryStorage?.set(
        session.session.token,
        JSON.stringify({
          user: session.user,
          session: session.session,
        }),
        Math.floor(
          (new Date(session.session.expiresAt).getTime() - Date.now()) / 1000,
        ),
      );
      return {
        theme: theme?.theme,
        ...session,
      };
    }
    throw redirect("/auth/sign-up/success");
  }
  return {
    theme: theme?.theme,
    ...session,
  };
}

export default function Layout({
  loaderData: { user, theme },
}: Route.ComponentProps) {
  const [, setTheme] = useTheme();
  useEffect(() => {
    if (theme) {
      setTheme(theme === "system" ? null : (theme as Theme));
    }
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
