import { redirect } from "react-router";
import { signIn, signUp } from "~/features/auth/client/auth";
import { signUpSchema } from "~/features/auth/schemas";

import type { Route } from "./+types/sign-up";

import { SignInCardSkeleton } from "@flarekit/auth/components/sign-in-card";
import { SignUpCard } from "@flarekit/auth/components/sign-up-card";

export const meta: Route.MetaFunction = () => [
  {
    title: "Sign Up",
    description: "Create your account",
  },
];

export function clientLoader() {}

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
    case "email": {
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
      }
      const signUpRes = await signUp.email({
        ...subscriber.data,
        callbackURL: "/dashboard",
      });
      if (signUpRes.error) {
        return signUpRes;
      }
      return redirect("/dashboard");
    }
  }
}

export function HydrateFallback() {
  return <SignInCardSkeleton />;
}

export default function SignUp() {
  return <SignUpCard />;
}
