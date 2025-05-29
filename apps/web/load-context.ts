import type { createAuthClient } from "better-auth/react";
import type { Context } from "hono";
import type { PlatformProxy } from "wrangler";
export type AuthClient = ReturnType<typeof createAuthClient>;
export type Session = AuthClient["$Infer"]["Session"]["session"];
export type User = AuthClient["$Infer"]["Session"]["user"];

export type EnvType = {
  MY_VAR: string;
  DB: D1Database;
  BETTER_AUTH_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
  IMAGE_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID: string;
  MY_BUCKET: R2Bucket;
  APP_KV: KVNamespace;
};

type Env = {
  Bindings: EnvType;
  Variables: {
    MY_VAR_IN_VARIABLES: string;
    user: User | null;
    session: Session | null;
  };
};

export type HonoEnv = Env;

type GetLoadContextArgs = {
  request: Request;
  context: {
    cloudflare: Omit<
      PlatformProxy<Env["Bindings"]>,
      "dispose" | "caches" | "cf"
    > & {
      caches: PlatformProxy<Env>["caches"] | CacheStorage;
      cf: Request["cf"];
    };
    hono: {
      context: Context<Env>;
    };
  };
};

declare module "react-router" {
  interface AppLoadContext extends ReturnType<typeof getLoadContext> {
    // This will merge the result of `getLoadContext` into the `AppLoadContext`
    extra: string;
    hono: {
      context: Context<Env>;
    };
  }
}

export function getLoadContext({ context }: GetLoadContextArgs) {
  return {
    ...context,
    extra: "stuff",
  };
}
