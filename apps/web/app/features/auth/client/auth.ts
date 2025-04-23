import { stripeClient } from "@better-auth/stripe/client";
import {
  apiKeyClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    twoFactorClient(),
    stripeClient({
      subscription: true,
    }),
    apiKeyClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
  changePassword,
  useSession,
  getSession,
  listSessions,
  subscription,
} = authClient;
