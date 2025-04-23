import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/sign-up";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { signIn, signUp } from "~/features/auth/client/auth";
import { RiGithubFill } from "@remixicon/react";
import { Spinner } from "~/components/spinner";
import { toast } from "sonner";
import { useEffect } from "react";
import { signUpSchema } from "~/features/auth/schemas";
import InputField from "~/features/auth/components/input-filed";
import { serverAuth } from "~/features/auth/server/auth";

import { SignUpCard } from "@flarekit/auth/components/sign-up-card";

export const meta: Route.MetaFunction = () => [
  {
    title: "Sign Up",
    description: "Create your account",
  },
];

interface ActionData {
  error?: {
    message: string;
    field: string;
  };
  success?: boolean;
}

export async function action({ request, context }: Route.ActionArgs) {
  const auth = serverAuth(context.cloudflare.env);
  const formData = await request.formData();
  const intent = formData.get("intent");
  try {
    switch (intent) {
      case "github":
        const socialRes = await auth.api.signInSocial({
          header: request.headers,
          body: {
            provider: "github",
            callbackURL: "/dashboard",
          },
        });
        if (socialRes.url) {
          return redirect(socialRes.url);
        }
        break;
      case "email":
        return {
          error: {
            message: "Something went wrong. Please try again.",
          },
        };
        break;
    }
  } catch (error) {
    let message = "Something went wrong. Please try again.";
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      error: {
        message: message,
      },
    };
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "github":
      signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
      break;
    case "email":
      const formPayload = Object.fromEntries(formData);
      const subscriber = signUpSchema.safeParse(formPayload);
      if (subscriber.error) {
        const issue = subscriber.error.issues[0];
        return {
          error: {
            ...issue,
            field: issue.path[0],
          },
        };
      } else {
        const signUpRes = await signUp.email({
          ...subscriber.data,
          callbackURL: "/dashboard",
        });
        if (signUpRes.error) {
          return signUpRes;
        }
        return redirect("/dashboard");
      }
      break;
  }
}

export default function SignUp() {
  const navigation = useNavigation();
  const actionData: ActionData | undefined = useActionData();
  const isPending = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      if (actionData.error.message) {
        toast.error(actionData.error.message);
      }
    }
  }, [actionData]);

  return <SignUpCard />;
}
