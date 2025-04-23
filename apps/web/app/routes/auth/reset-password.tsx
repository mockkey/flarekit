import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { useEffect } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { resetPassword } from "~/features/auth/client/auth";
import InputField from "~/features/auth/components/input-filed";
import { resetPasswordSchema } from "~/features/auth/schemas";
import type { Route } from "./+types/reset-password";

export const meta = () => [
  {
    title: "Reset Password",
    description: "Create a new password",
  },
];

interface ActionData {
  error?: {
    message: string;
    field?: string;
  };
  success?: boolean;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    throw redirect("/auth/forget-password");
  }

  return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return {
        error: {
          message: "Invalid reset token",
          field: "password",
        },
      };
    }

    const formPayload = Object.fromEntries(formData);
    const result = resetPasswordSchema.safeParse(formPayload);

    if (!result.success) {
      const error = result.error.issues[0];
      return {
        error: {
          message: error.message,
          field: error.path[0].toString(),
        },
      };
    }

    const { error } = await resetPassword({
      token,
      newPassword: result.data.password,
    });

    if (error) {
      return {
        error: {
          message: error.message,
          field: "password",
        },
      };
    }

    return redirect("/auth/sign-in");
  } catch (_error) {
    return {
      error: {
        message: "Failed to reset password. Please try again.",
        field: "password",
      },
    };
  }
}

export default function ResetPassword() {
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();
  const isPending = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error.message);
    }
  }, [actionData]);

  return (
    <Card className="flex flex-col gap-6">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>

      <CardContent>
        <Form method="post" className="space-y-6">
          <InputField
            label="New Password"
            name="password"
            type="password"
            error={actionData?.error?.field === "password"}
            disabled={isPending}
          />
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            error={actionData?.error?.field === "confirmPassword"}
            disabled={isPending}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner className="size-4" />
                <span>Resetting password...</span>
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
