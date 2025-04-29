import {
  apiKeyClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const AuthClient = createAuthClient({
  plugins: [passkeyClient(), twoFactorClient(), apiKeyClient()],
});

export const defaultAuthClient = AuthClient;

export const {
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
  changePassword,
  useSession,
  deleteUser,
  getSession,
  listSessions,
} = defaultAuthClient;

export type betterHooks = ReturnType<typeof createAuthClient>;
