import { Link, Outlet } from 'react-router'
import { Button } from '@flarekit/ui/components/ui/button'
import ThemeToggle from '~/components/theme-toggle'
import { RiSparklingFill } from '@remixicon/react'
import Footer from '~/components/marketing/landing/footer'

export default function Layout() {
  return (
    <>
      <header className="h-[65px] border-b  bg-white/80 dark:bg-black/80 px-4">
        <nav className="h-full container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold flex flex-row gap-x-2">
              <RiSparklingFill
              className='text-primary size-8'
              />
              Flare Kit</h1>
            <div className="flex items-center space-x-6">
                <ThemeToggle />
                <Button variant="link">GitHub</Button>
                <Link to="/auth/sign-in" >
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
  )
}
