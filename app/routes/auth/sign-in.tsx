import { Form, Link, redirect } from "react-router";
import type { Route } from "../auth/+types/sign-in";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { Label } from "@flarekit/ui/components/ui/label";
import { Input } from "@flarekit/ui/components/ui/input";
import { signIn } from "~/features/auth/client/auth";
import { RiGithubFill } from "@remixicon/react";



export const meta:Route.MetaFunction = () => [
  {
    title: "Sign In",
    description: "Sign in to your account",
  }
]

export function HydrateFallback() {
  return <div>Loading...</div>
}

// export async function clientLoader(){
//   await new Promise((res)=>{setTimeout(res,1000)})
//   console.log('clientLoader')
// }

export async function clientAction({
  request,
}: Route.ClientActionArgs){
  let formData = await request.formData()
  let intent = formData.get("intent")
  switch(intent){
    case 'github':
      signIn.social({
        provider: 'github',
        callbackURL: "/dashboard",
      })
    break;
    default:
      signIn.email({
        email:'xxx@xx',
        password:'xxxxx'
      })
      console.log('email login')
      break
  }
  return true
}

export async function action({request}:Route.ActionArgs){
  let formData = await request.formData()
  let intent = formData.get("intent")
  switch(intent){
    case 'github':
      console.log('intent github')

    break;
    default:
      console.log('email login')
      break
  }
  // return {message:'action test'}
 return redirect('/')
}


export default function SignIn() {

  return (
    <Card className='flex flex-col gap-6' >
    <CardHeader className="text-center">
      <CardTitle className="text-xl">Welcome back</CardTitle>
      <CardDescription>
        Login with your Apple or Google account
      </CardDescription>
    </CardHeader>
    <CardContent>
   
        <div className="grid gap-6">
          <div className="flex flex-col gap-4">
            <Form method="post">
              <Button type="submit" 
              name="intent"
              value={'github'}
              variant="outline" 
              className="w-full">
                <RiGithubFill  size={32}/>
                Login with Github 
              </Button>
            </Form>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <Form method="post" >
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit"
            name="intent"
            value={'email'}
            className="w-full" >
              Login
            </Button>
          </div>
           
          </Form>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link  to='/auth/sign-up'>
              <Button variant={'link'} className="p-0" >
                Sign up
              </Button>
            </Link>
          </div>
        </div>
    </CardContent>
  </Card>
  )
}
