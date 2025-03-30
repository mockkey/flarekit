import { Route } from '../+types/root'
import { serverAuth } from '~/features/auth/server/auth'
import { Outlet, redirect } from 'react-router'
import { Button } from '@flarekit/ui/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@flarekit/ui/components/ui/dropdown-menu'
import ThemeToggle from '~/components/theme-toggle'


export default function Layout() {
  return (
    <>
      <header className="py-6  border-b">
        <nav className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Flare Kit</h1>
            <div className="flex items-center space-x-6">
                <ThemeToggle />
                <div className="relative group">
                    <button className="flex items-center space-x-2 hover:text-blue-600">
                        <i className="fas fa-globe text-xl"></i>
                        <span className="text-sm">EN</span>
                    </button>
                    <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl hidden group-hover:block border dark:bg-gray-800">
                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-lang="en">
                            <span className="flag-icon flag-icon-us mr-2"></span>
                            English
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" data-lang="zh">
                            <span className="flag-icon flag-icon-cn mr-2"></span>
                            中文
                        </a>
                    </div>
                </div>
                
                <button id="theme-toggle" className="p-2 hover:text-blue-600">
                    <i className="fas fa-sun text-xl hidden dark:block" id="light-icon"></i>
                    <i className="fas fa-moon text-xl block dark:hidden" id="dark-icon"></i>
                </button>
                <Button variant="link">GitHub</Button>
                <Button>Get Started</Button>
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
