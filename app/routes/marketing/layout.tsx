import { Route } from '../+types/root'
import { serverAuth } from '~/features/auth/server/auth'
import { Link, Outlet } from 'react-router'
import { Button } from '@flarekit/ui/components/ui/button'
import ThemeToggle from '~/components/theme-toggle'


export default function Layout() {
  return (
    <>
      <header className="py-6  border-b">
        <nav className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Flare Kit</h1>
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
        <footer>
            footer
        </footer>
    </>
  )
}
