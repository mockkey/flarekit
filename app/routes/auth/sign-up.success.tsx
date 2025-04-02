import { Link, redirect, useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { RiMailLine, RiArrowLeftLine } from "@remixicon/react";
import { Route } from "./+types/sign-up.success";
import { serverAuth } from "~/features/auth/server/auth";
import { toast } from "sonner";

export const meta: Route.MetaFunction = () => [
  {
    title: "Verify Your Email",
    description: "Please verify your email address to continue",
  }
];

export const loader = async ({ request, context }: Route.LoaderArgs) =>{
      const auth = serverAuth(context.cloudflare.env)
      const session = await auth.api.getSession({
        headers: request.headers,
      })

      if(!session) {
          throw redirect('/auth/sign-in')
      }
      
      if(session.user.emailVerified=== true){
          throw redirect('/dashboard')
      }

      return session

}

export const action = () =>{
  
}


export default function SignUpSuccess({
  loaderData: { user },
}: Route.ComponentProps) {

  return (
    <Card className="flex flex-col gap-6 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 rounded-full bg-blue-50 p-3 dark:bg-blue-900/20">
          <RiMailLine className="size-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription className="mt-2">
          We sent a verification link to:
          <div className="mt-1 font-medium text-foreground">{user.email}</div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="text-center">
            Click the link in your email to verify your account.
            The link will expire in 24 hours.
          </p>
          
          <div className="mt-4 flex flex-col gap-2 text-center">
            <p>Can't find the email? Check your spam folder or</p>
            <Button 
              variant="link" 
              className="h-auto p-0"
              onClick={() => {
                // 实现重新发送邮件的逻辑
                toast.info(`Verification email sent to ${email}`)
              }}
            >
              click here to resend verification email
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <Link to="/auth/sign-in">
            <Button variant="outline" className="w-full" size="lg">
              <RiArrowLeftLine className="mr-2" />
              Return to Sign in
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
