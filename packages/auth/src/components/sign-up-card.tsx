import { Spinner } from "@flarekit/ui/components/spinner";
import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { useActionState } from "react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth-provider";
import { signUpSchema } from "../schema/auth";
import type { Providers } from "../types/auth-client";
import type { FormState } from "../types/from";
import { InputField } from "./input-field";
import { SocicalButton } from "./socical-button";

interface SignUpCardProps {
  title?: string;
  description?: string;
  callbackURL?: string;
}

export function SignUpCard({
  title = "Create an account",
  description = "Get started with your free account",
}: SignUpCardProps) {
  const { Link, socials, authClient, navigate } = useAuth();

  const signUpAction = async (_: FormState, payload: FormData) => {
    const intent = payload.get("intent");
    switch (intent) {
      case "email": {
        const formData = Object.fromEntries(payload);
        const parsed = signUpSchema.safeParse(formData);
        const fields: Record<string, string> = {};
        for (const key of Object.keys(formData)) {
          fields[key] = formData[key].toString();
        }
        if (!parsed.success) {
          const errors = parsed.error.flatten().fieldErrors;
          return {
            success: false,
            fields,
            errors,
          };
        }

        const { error } = await authClient!.signUp.email({
          ...parsed.data,
          callbackURL: "/dashboard",
        });

        if (error) {
          toast.error(error.message);
        }

        navigate("/dashboard");

        return {
          success: true,
        };
      }
      default:
        {
          authClient?.signIn.social({
            provider: intent as Providers,
            callbackURL: "/dashboard",
          });
        }
        return {
          success: true,
        };
    }
  };

  const [state, formAction, isPending] = useActionState(signUpAction, {
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
          <form action={formAction} className="space-y-4">
            <div className="space-y-4">
              <InputField
                label="Full Name"
                name="name"
                defaultValue={state?.fields?.name}
                errorMessage={state?.errors?.name}
                disabled={isPending}
                placeholder="John Doe"
              />
              <InputField
                defaultValue={state?.fields?.email}
                errorMessage={state?.errors?.email}
                disabled={isPending}
                label="Email"
                name="email"
                type="email"
                placeholder="You@example.com"
              />
              <InputField
                defaultValue={state?.fields?.password}
                errorMessage={state?.errors?.password}
                disabled={isPending}
                label="Password"
                name="password"
                type="password"
                placeholder="Password"
              />
            </div>

            <Button
              disabled={isPending}
              type="submit"
              name="intent"
              value="email"
              className="w-full"
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
