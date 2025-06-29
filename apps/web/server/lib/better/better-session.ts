import { env } from "cloudflare:workers";
import { base64 } from "@better-auth/utils/base64";
import { binary } from "@better-auth/utils/binary";
import { createHMAC } from "@better-auth/utils/hmac";
import { DbService } from "@flarekit/db";
import type { Session, User } from "better-auth";
import type { Context } from "hono";
import { getCookie, getSignedCookie, setCookie } from "hono/cookie";
import { serverAuth } from "~/features/auth/server/auth.server";
import { safeJSONParse } from "../utils";

const auth = serverAuth();
const dbService = DbService(env.DB);

export const getSession = async (ctx: Context) => {
  auth.$context;
  const context = await auth.$context;
  const sessionTokenName = context.authCookies.sessionToken.name;
  const sessionDataName = context.authCookies.sessionData.name;
  const secret = context.secret;
  const cookies = await getSignedCookie(ctx, secret);
  const sessionCookieToken = cookies[sessionTokenName];

  if (!sessionCookieToken) {
    return null;
  }

  const sessionDataCookie = getCookie(ctx, sessionDataName);

  const sessionDataPayload = sessionDataCookie
    ? safeJSONParse<{
        session: {
          session: Session;
          user: User;
        };
        signature: string;
        expiresAt: number;
      }>(binary.decode(base64.decode(sessionDataCookie)))
    : null;

  if (sessionDataPayload) {
    const isValid = await createHMAC("SHA-256", "base64urlnopad").verify(
      secret,
      JSON.stringify({
        ...sessionDataPayload.session,
        expiresAt: sessionDataPayload.expiresAt,
      }),
      sessionDataPayload.signature,
    );

    if (!isValid) {
      setCookie(ctx, sessionDataName, "", {
        maxAge: 0,
      });
      return null;
    }
  }

  const session =
    await dbService?.users.getUserSessionByToken(sessionCookieToken);

  if (!session || session.session.expiresAt < new Date()) {
    deleteSessionCookie(ctx);
    if (session) {
      /**
       * if session expired clean up the session
       */
      await context.internalAdapter.deleteSession(session.session.token);
    }
    return null;
  }

  return session;
};

export async function deleteSessionCookie(
  ctx: Context,
  skipDontRememberMe?: boolean,
) {
  const context = await auth.$context;

  setCookie(ctx, context.authCookies.sessionToken.name, "", {
    ...context.authCookies.sessionToken.options,
    maxAge: 0,
  });
  setCookie(ctx, context.authCookies.sessionData.name, "", {
    ...context.authCookies.sessionData.options,
    maxAge: 0,
  });
  if (!skipDontRememberMe) {
    setCookie(ctx, context.authCookies.dontRememberToken.name, "", {
      ...context.authCookies.dontRememberToken.options,
      maxAge: 0,
    });
  }
}
