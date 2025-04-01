
import { Link, Outlet } from 'react-router'
import { Route } from '../auth/+types/layout';
import { Button } from '@flarekit/ui/components/ui/button';
import { ArrowLeft } from 'lucide-react';



export default function Layout() {
  return (
    <div className='flex flex-col bg-muted min-h-svh'>
    <header className='h-[65px] container flex felx-col w-full mx-auto items-center'>
      <Link to={'/'}>
        <Button className="cursor-pointer" variant={'ghost'}>
          <ArrowLeft />
          Back
        </Button>
      </Link>
    </header>
    <div className="container flex flex-1 flex-col items-center justify-center gap-6  p-6 md:p-10 mx-auto">

    <div className="flex w-full max-w-sm flex-col gap-6">
    <a href="#" className="flex items-center gap-2 self-center font-medium">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
      </div>
      Sass Inc.
    </a>
      <Outlet />
      </div>
    </div>
    </div>

  )
}
