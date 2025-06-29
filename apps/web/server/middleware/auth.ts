import type { Context, Next } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { getSession } from "server/lib/better/better-session";
import { AppError, ForbiddenError } from "server/lib/error";
import { serverAuth } from "~/features/auth/server/auth.server";

type PermissionType =
  | "read"
  | "write"
  | "delete"
  | "restore"
  | "read_usage"
  | "permanent_delete"
  | "create"
  | "upload";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RouteKey = `${HttpMethod}:${string}`;

type ResourceType = "files" | "storage" | "trash";

type RequireAuthOptions = Partial<Record<ResourceType, PermissionType[]>>;

export const ROUTE_PERMISSION_MAP: Record<RouteKey, RequireAuthOptions> = {};

export const requireAuth = (options?: RequireAuthOptions) => {
  return async (c: Context, next: Next) => {
    try {
      const matchedRoutePath = c.req.routePath;
      const requestMethod = c.req.method;
      const routeKey = `${requestMethod}:${matchedRoutePath}` as RouteKey;
      const requiredPermissionsMap = ROUTE_PERMISSION_MAP[routeKey];
      if (!requiredPermissionsMap && !options) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const bearer = bearerAuth({
        verifyToken: async (token: string) => {
          if (!token) return false;
          const auth = serverAuth();
          // @ts-ignore
          const { key, error, valid } = await auth.api.verifyApiKey({
            body: {
              key: token,
              permissions: options || requiredPermissionsMap,
            },
          });
          if (error) {
            // log
            throw new ForbiddenError(error.message);
          }
          if (!valid) return false;
          c.set("apiKeyData", key);
          c.set("userId", key.userId);
          return true;
        },
      });
      await bearer(c, next);
    } catch (error) {
      if (error instanceof AppError) {
        return c.json(
          {
            success: false,
            error: error.message,
          },
          error.statusCode as 400 | 401 | 403 | 404 | 500,
        );
      }
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
};

export const checkAuth = createMiddleware(async (c, next) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("user", session.user);
  c.set("session", session.session);
  c.set("userId", session.user.id);
  return next();
});
