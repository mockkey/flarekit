import type { Context } from "hono";
import { serverAuth } from "~/features/auth/server/auth.server";

export const getSession = async (ctx: Context) => {
  const auth = serverAuth();
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });
  if (session) {
    return session;
  }
};
