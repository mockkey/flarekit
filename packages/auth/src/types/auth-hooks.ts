import type { User as AnyUser } from "better-auth";
import type { Session, User } from "./auth-client";
import type { FetchError } from "./fetch-error.ts";

type AuthHook<T> = {
  isPending: boolean;
  data?: T | null;
  error?: FetchError | null;
  refetch?: () => Promise<void>;
};

export type AuthHooks = {
  useSession: () => AuthHook<{ session: Session; user: User }>;
  useListAccounts: () => AuthHook<{ accountId: string; provider: string }[]>;
  useListDeviceSessions: () => AuthHook<{ session: Session; user: AnyUser }[]>;
  useListSessions: () => AuthHook<Session[]>;
  useListPasskeys: () => AuthHook<{ id: string; createdAt: Date }[]>;
  useIsRestoring?: () => boolean;
};
