import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "../auth/+types/sign-in";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Button } from "@flarekit/ui/components/ui/button";
import { signIn } from "~/features/auth/client/auth";
import { RiGithubFill } from "@remixicon/react";
import { signInSchema } from "~/features/auth/schemas";
import InputField from "~/features/auth/components/input-filed";
import { toast } from "sonner";
import { useEffect } from "react";
import { Spinner } from "~/components/spinner";
import {
  SignInCard,
  SignInCardSkeleton,
} from "@flarekit/auth/components/sign-in-card";

export const meta: Route.MetaFunction = () => [
  {
    title: "Sign In",
    description: "Sign in to your account",
  },
];

interface ActionData {
  error?: {
    message: string;
    field: string;
  };
  success?: boolean;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  let formData = await request.formData();
  let intent = formData.get("intent");
  switch (intent) {
    case "github":
      signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
      break;
    default:
      const formPayload = Object.fromEntries(formData);
      const subscriber = signInSchema.safeParse(formPayload);
      if (subscriber.error) {
        const issue = subscriber.error.issues[0];
        return {
          error: {
            ...issue,
            field: issue.path[0],
          },
        };
      } else {
        const signUpRes = await signIn.email({
          ...subscriber.data,
          callbackURL: "/dashboard",
        });
        if (signUpRes.error) {
          return signUpRes;
        }
      }
      break;
  }
  return true;
}

export function clientLoader(){

}

export function HydrateFallback() {
  return <SignInCardSkeleton />;
}

export default function SignIn() {
  return <SignInCard />;
}
