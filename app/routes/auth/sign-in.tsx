import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "../auth/+types/sign-in";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { signIn } from "~/features/auth/client/auth";
import { RiGithubFill } from "@remixicon/react";
import { signInSchema } from "~/features/auth/schemas";
import InputField from "~/features/auth/components/input-filed";
import { toast } from "sonner";
import { useEffect } from "react";
import { Spinner } from "~/components/spinner";



export const meta:Route.MetaFunction = () => [
  {
    title: "Sign In",
    description: "Sign in to your account",
  }
]

interface ActionData  {
  error?: {
    message: string;
    field: string;
  };
  success?: boolean;
}


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
        const formPayload = Object.fromEntries(formData)
        const subscriber = signInSchema.safeParse(formPayload)
        if(subscriber.error){
          const issue = subscriber.error.issues[0]
          return {
            error:{
              ...issue,
              field:issue.path[0]
            }
          }
        }else{
          const signUpRes = await signIn.email({
            ...subscriber.data,
             callbackURL: "/dashboard"
          })
          if(signUpRes.error){
            return signUpRes
          }
        }
      break
  }
  return true
}




export default function SignIn() {
  const navigation = useNavigation()
  const actionData:ActionData | undefined = useActionData()
  const isPending = navigation.state === "submitting"

  useEffect(() => {
    if (actionData?.error) {
        if(actionData.error.message){
            toast.error(actionData.error.message)
        }
    }
  }, [actionData])

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
              className="w-full"
              disabled={isPending}
              >
                <RiGithubFill  size={32}/>
                {isPending ? 'Connecting...' : 'Continue with Github'}
              </Button>
            </Form>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <Form method="post">
          <div className="space-y-4">
            <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="m@example.com"
                error={actionData?.error?.field === 'email' }
                disabled={isPending}
              />
              <InputField
                  label="Password"
                  name="password"
                  type="password"
                  placeholder=""
                  error={actionData?.error?.field === 'password' }
                  disabled={isPending}
                  action={{
                    label: "Forgot password?",
                    href: "/auth/reset-password"
                  }}
              /> 
            <Button type="submit"
            name="intent"
            value={'email'}
            disabled={isPending}
            className="w-full" >
               {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="size-4" />
                  <span>Sign In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
           
          </Form>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link  to='/auth/sign-up'>
              <Button variant={'link'} 
              className="p-0" 
              >
                Sign up
              </Button>
            </Link>
          </div>
        </div>
    </CardContent>
  </Card>
  )
}
