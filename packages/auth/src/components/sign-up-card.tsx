import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { useActionState } from "react";
import { InputField } from "./input-field";
import { Spinner } from "@flarekit/ui/components/spinner";
import { useAuth } from "../lib/auth-provider";
import { signUpAction } from "../actions/sign-up-action";
import { SocicalButton } from "./socical-button";

export function SignUpCard() {
  const { Link, socials } = useAuth();

  const [state, formAction, isPending] = useActionState(signUpAction, {
    success: false,
    fields: {},
    errors: {},
  });
  return (
    <Card className="flex flex-col gap-6">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>Get started with your free account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {socials?.map && (
            <form action={formAction} className="flex flex-col gap-2">
              {socials.map((social) => {
                return (
                  <SocicalButton
                    key={social.name}
                    label={`Continue with ${social.name}`}
                    name="intent"
                    value={social.name}
                    icon={social.icon}
                    isLoading={isPending}
                  />
                );
              })}
            </form>
          )}

          {/* Divider */}
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or with email
            </span>
          </div>

          {/* Email Sign Up Form */}
          <form method="post" action={formAction} className="space-y-4">
            <div className="space-y-4">
              <InputField
                label="Full Name"
                name="name"
                defaultValue={state.fields?.name}
                placeholder="John Doe"
                errorMessage={state.errors?.name}
                disabled={isPending}
              />
              <InputField
                defaultValue={state.fields?.email}
                errorMessage={state.errors?.email}
                disabled={isPending}
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
              />
              <InputField
                defaultValue={state.fields?.password}
                errorMessage={state.errors?.password}
                disabled={isPending}
                label="Password"
                name="password"
                type="password"
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
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/sign-in">
              <Button variant="link" className="p-0">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
