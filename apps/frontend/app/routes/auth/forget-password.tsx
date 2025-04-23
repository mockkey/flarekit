import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { useEffect } from "react";
import { Form, Link, useActionData, useNavigation } from "react-router";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { forgetPassword } from "~/features/auth/client/auth";
import InputField from "~/features/auth/components/input-filed";
import { emailSchema } from "~/features/auth/schemas";
import type { Route } from "./+types/forget-password";

export const meta = () => [
  {
    title: "Forgot Password",
    description: "Reset your password",
  },
];

interface ActionData {
  error?: {
    message: string;
    field?: string;
  };
  success?: boolean;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const formPayload = Object.fromEntries(formData);
    const subscriber = emailSchema.safeParse(formPayload);

    if (subscriber.error) {
      return {
        error: {
          message: subscriber.error.issues[0].message,
          field: "email",
        },
      };
    }

    const { data, error } = await forgetPassword({
      email: subscriber.data.email,
      redirectTo: "/auth/reset-password",
    });

    if (error) {
      return {
        error: {
          message: error.message,
          field: "email",
        },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      error: {
        message: "Failed to send reset email. Please try again.",
        field: "email",
      },
    };
  }
}

export default function ForgetPassword() {
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();
  const isPending = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error.message);
    }
    if (actionData?.success) {
      toast.success("Password reset instructions sent to your email");
    }
  }, [actionData]);

  return (
    <Card className="flex flex-col gap-6">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot your password?</CardTitle>
        <CardDescription>
          No worries, we'll send you reset instructions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6">
          <Form method="post" className="space-y-4">
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              error={actionData?.error?.field === "email"}
              disabled={isPending}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="size-4" />
                  <span>Sending instructions...</span>
                </div>
              ) : (
                "Send Instructions"
              )}
            </Button>
          </Form>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Remember your password?
            </span>
          </div>

          <div className="text-center">
            <Link to="/auth/sign-in">
              <Button variant="link" className="p-0">
                Back to Sign in
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
