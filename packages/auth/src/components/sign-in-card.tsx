import { InputField } from "@flarekit/auth/components/input-field";
import { useAuth } from "@flarekit/auth/lib/auth-provider";
import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Skeleton } from "@flarekit/ui/components/ui/skeleton";
import { useActionState } from "react";
import { toast } from "sonner";
import { signInSchema } from "../schema/auth";
import type { Providers } from "../types/auth-client";
import type { FormState } from "../types/from";
import { ActionButton } from "./action-button";
import { SocicalButton } from "./socical-button";

interface SignInCardProps {
  title?: string;
  description?: string;
}

export const SignInCard = ({
  title = "Welcome back",
  description = "Login with your Apple or Google account",
}: SignInCardProps) => {
  const { Link, socials, authClient } = useAuth();

  const signInAction = async (_: FormState, payload: FormData) => {
    const intent = payload.get("intent");

    switch (intent) {
      case "email": {
        const formData = Object.fromEntries(payload);
        const parsed = signInSchema.safeParse(formData);
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

        const { error } = await authClient!.signIn.email({
          ...parsed.data,
          callbackURL: "/dashboard",
        });

        if (error) {
          toast.error(error.message);
        }
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

  const [state, formAction, isPending] = useActionState(signInAction, {
    success: false,
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
                defaultValue={state?.fields?.email}
                placeholder="m@example.com"
                errorMessage={state?.errors?.email}
                disabled={isPending}
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="123abc!"
                defaultValue={state?.fields?.password}
                errorMessage={state?.errors?.password}
                disabled={isPending}
                action={{
                  label: "Forgot password?",
                  href: "/auth/reset-password",
                }}
              />
              <ActionButton
                type="submit"
                name="intent"
                value={"email"}
                disabled={isPending}
              >
                Sign In
              </ActionButton>
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
