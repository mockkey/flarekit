import { serverAuth } from '~/features/auth/server/auth'
import { Outlet, redirect } from 'react-router'
import { Avatar, AvatarImage } from '@flarekit/ui/components/ui/avatar'
import type { Route } from "../dashboard/+types/layout";

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
  return (
    <div className='flex flex-col h-screen w-screen'>
        <header className='flex items-center justify-between bg-gray-800 p-4 text-white'>
            { session && (
            <Avatar>
                <AvatarImage src={session?.user.image ? session?.user.image : ''} alt="User Avatar" />
            </Avatar>
            )} 
        </header>
        <main>
            <Outlet />
        </main>
    </div>
  )
}
