import { serverAuth } from "~/features/auth/server/auth";
import { Outlet, redirect } from "react-router";
import type { Route } from "../dashboard/+types/layout";
import { AuthProvider } from "~/features/auth/hooks";
import SidebarNav from "~/components/dashboard/sidebar-nav";
import {
  SidebarInset,
  SidebarProvider,
} from "@flarekit/ui/components/ui/sidebar";
import Header from "~/components/dashboard/header";

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
  return { session };
}

export default function Layout({
  loaderData: { session },
}: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AuthProvider userSession={session}>
        <SidebarNav />
        <SidebarInset>
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <Header user={session.user} />

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
