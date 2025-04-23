import type { Context, Next } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { HTTPException } from "hono/http-exception";
import { serverAuth } from "~/features/auth/server/auth";

interface RequireAuthOptions {
  [resource: string]: string[];
}

export const requireAuth = (options: RequireAuthOptions = {}) => {
  return async (c: Context, next: Next) => {
    try {
      const bearer = bearerAuth({
        verifyToken: async (token: string) => {
          if (!token) return false;
          const auth = serverAuth(c.env);
          // @ts-ignore
          const { key, error, valid } = await auth.api.verifyApiKey({
            body: {
              key: token,
              permissions: options,
            },
          });
          if (error) {
            // log
            throw new HTTPException(401, error.message);
          }
          if (!valid) return false;
          c.set("apiKeyData", key);
          return true;
        },
      });
      await bearer(c, next);
    } catch (_error) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
};
