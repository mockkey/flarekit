import type { Context, Next } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { serverAuth } from "~/features/auth/server/auth.server";

interface RequireAuthOptions {
  [resource: string]: string[];
}

export const requireAuth = (options: RequireAuthOptions = {}) => {
  return async (c: Context, next: Next) => {
    try {
      const bearer = bearerAuth({
        verifyToken: async (token: string) => {
          if (!token) return false;
          const auth = serverAuth();
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

export const checkAuth = createMiddleware(async (c, next) => {
  const auth = serverAuth();
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});
