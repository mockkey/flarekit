import { memo, useActionState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { InputField } from "@flarekit/auth/components/input-field";
import { signInAction } from "../actions/sign-in-action";
import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { Spinner } from "@flarekit/ui/components/spinner";
import { useAuth } from "@flarekit/auth/lib/auth-provider";

interface SignInCardProps {
  title?: string;
  description?: string;
}

export const SignInCard = ({
  title = "Welcome back",
  description = "Login with your Apple or Google account",
}: SignInCardProps) => {
  const { Link } = useAuth();
  const [state, formAction, isPending] = useActionState(signInAction, {
    success: false,
    fields: {},
    errors: {},
  });

  return (
    <Card className="flex flex-col gap-6">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="flex flex-col gap-4">
            <form action={formAction}>
              <Button
                type="submit"
                name="intent"
                value={"github"}
                variant="outline"
                className="w-full"
                disabled={isPending}
              >
                {/* <RiGithubFill size={32} /> */}
                {isPending ? "Connecting..." : "Continue with Github"}
              </Button>
            </form>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <form action={formAction}>
            <div className="space-y-4">
              <InputField
                label="Email"
                name="email"
                type="email"
                defaultValue={state.fields?.email}
                placeholder="m@example.com"
                errorMessage={state.errors?.email}
                disabled={isPending}
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="123abc!"
                defaultValue={state.fields?.password}
                errorMessage={state.errors?.password}
                disabled={isPending}
                action={{
                  label: "Forgot password?",
                  href: "/auth/reset-password",
                }}
              />
              <Button
                type="submit"
                name="intent"
                value={"email"}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="size-4" />
                    <span>Sign In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up">
              <Button variant={"link"} className="p-0">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SignInCardSkeleton = () => {
  return (
    <Card className="flex flex-col gap-6">
      <CardHeader className="text-center">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[200px] mx-auto" />
          <Skeleton className="h-4 w-[300px] mx-auto" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <Skeleton className="h-10 w-full" /> {/* Github button */}
          <div className="relative text-center">
            <Skeleton className="h-4 w-[150px] mx-auto" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[60px]" /> {/* Email label */}
              <Skeleton className="h-10 w-full" /> {/* Email input */}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[80px]" /> {/* Password label */}
                <Skeleton className="h-4 w-[100px]" /> {/* Forgot password */}
              </div>
              <Skeleton className="h-10 w-full" /> {/* Password input */}
            </div>
            <Skeleton className="h-10 w-full" /> {/* Submit button */}
          </div>
          <div className="text-center">
            <Skeleton className="h-4 w-[200px] mx-auto" /> {/* Sign up text */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
