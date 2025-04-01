import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "../auth/+types/sign-up";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { Label } from "@flarekit/ui/components/ui/label";
import { Input } from "@flarekit/ui/components/ui/input";
import { signIn, signUp } from "~/features/auth/client/auth";
import { RiGithubFill } from "@remixicon/react";
import { Spinner } from "~/components/spinner";
import { toast } from 'sonner';
import { useEffect } from "react";
import { serverAuth } from "~/features/auth/server/auth";

export const meta: Route.MetaFunction = () => [
  {
    title: "Sign Up",
    description: "Create your account",
  }
];

interface ActionData {
  error?: {
    message: string;
    field?: string;
  };
  success?: boolean;
}

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  try {
    if (intent === 'github') {
        
      return signIn.social({
        provider: 'github',
        callbackURL: "/dashboard",
      });
    }

    const { data, error } = await signUp.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
    });

    if (error) {
      console.log('error',error)  
      return { error: {
        message: error.message,
        field: error.field
      }};
    }

    return redirect('/dashboard');
  } catch (error) {
    return {
      error: {
        message: 'Something went wrong. Please try again.',
      }
    };
  }
}


export async function clientAction({
  request,
}: Route.ClientActionArgs){
    const formData = await request.formData()
    console.log('formData',formData)

    return {
        error:{
            message:'error'
        }
    }
}

export default function SignUp() {
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();
  const isPending = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
        if(actionData.error.message){
            toast.error(actionData.error.message)
        }
    }
  }, [actionData]);

  return (
    <Card className='flex flex-col gap-6'>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Get started with your free account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Social Sign Up */}
          <Form method="post">
            <Button 
              type="submit"
              name="intent"
              value="github"
              variant="outline"
              className="w-full"
              disabled={isPending}
            >
              <RiGithubFill size={32} />
              {isPending ? 'Connecting...' : 'Continue with Github'}
            </Button>
          </Form>

          {/* Divider */}
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or with email
            </span>
          </div>

          {/* Email Sign Up Form */}
          <Form method="post" className="space-y-4">
            <div className="space-y-4">
              <InputField
                label="Full Name"
                name="name"
                placeholder="John Doe"
                error={actionData?.error?.field === 'name'}
                disabled={isPending}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                error={actionData?.error?.field === 'email'}
                disabled={isPending}
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                error={actionData?.error?.field === 'password'}
                disabled={isPending}
              />
            </div>

            <Button 
              type="submit"
              name="intent"
              value="email"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="size-4" />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </Form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth/sign-in">
              <Button variant="link" className="p-0">Sign in</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  error,
  disabled
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required
        disabled={disabled}
        aria-invalid={error}
        className={error ? "border-red-500" : undefined}
      />
    </div>
  );
}
