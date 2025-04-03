import { serverAuth } from '~/features/auth/server/auth'
import { Outlet, Link, redirect } from 'react-router'
import { Button } from '@flarekit/ui/components/ui/button'
import { RiSparklingFill, RiMenuFoldLine, RiMenuUnfoldLine, RiUser3Line, RiSettings4Line, RiLogoutCircleLine } from "@remixicon/react"
import type { Route } from "../dashboard/+types/layout"
import { useState } from 'react'
import { cn } from '~/lib/utils'
import UserNav from '~/components/dashboard/user-nav'

export async function loader({ request, context }: Route.LoaderArgs) {
    const auth = serverAuth(context.cloudflare.env)
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    console.log('session',session)

    if(!session) {
        throw redirect('/auth/sign-in')
    }
    if(session.user.emailVerified=== false){
        throw redirect('/auth/sign-up/success')
    }
    return { session }
}

export default function Layout({
  loaderData: { session },
}: Route.ComponentProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-50 dark:bg-slate-900 border-r transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}>
        <div className="flex h-16 items-center gap-2 px-4 border-b">
          <RiSparklingFill className="text-primary size-8" />
          {!collapsed && <span className="font-semibold">Flare Kit</span>}
        </div>

        <nav className="p-2 space-y-2">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              className={cn("w-full justify-start", 
                collapsed ? "px-2" : "px-4"
              )}
            >
              <RiSparklingFill className="size-5" />
              {!collapsed && <span className="ml-2">Dashboard</span>}
            </Button>
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-white dark:bg-slate-950 px-4">
          <div className="flex h-full items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <RiMenuUnfoldLine className="size-5" />
              ) : (
                <RiMenuFoldLine className="size-5" />
              )}
            </Button>
            <UserNav user={session.user} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-100 dark:bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
