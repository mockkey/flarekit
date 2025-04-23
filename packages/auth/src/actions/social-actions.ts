import {
  socialProviderList,
  type socialProviders,
} from "better-auth/social-providers";
import { toast } from "sonner";
import { signIn } from "../lib/auth-client";

export type providerPlatform = keyof typeof socialProviders;

export const SocialActions = async (intent: providerPlatform) => {
  if (socialProviderList.includes(intent)) {
    const { error } = await signIn.social({
      provider: intent,
      callbackURL: "/dashboard",
    });
    if (error) {
      toast.error(error.message);
    } else {
      return true;
    }
  }
  return false;
};
