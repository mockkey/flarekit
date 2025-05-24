import type { User } from "better-auth/types";
// server/index.ts
import { Hono } from "hono";
import type { EnvType } from "load-context";
import { validatePermissions } from "~/config/permissions";
import { serverAuth } from "~/features/auth/server/auth.server";
import { StripeClient } from "~/features/auth/server/stripe";
import api from "./api";

const app = new Hono<{
  Bindings: EnvType;
  Variables: {
    MY_VAR_IN_VARIABLES: string;
  };
}>();

app.use(async (c, next) => {
  c.set("MY_VAR_IN_VARIABLES", "My variable set in c.set");
  await next();
  c.header("X-Powered-By", "React Router and Hono");
});

app.route("/admin/api", api);

app.get("/api/ping", (c) => {
  return c.json({ message: "pong" });
});

interface ExtendedUser extends User {
  stripeCustomerId?: string;
}

app.post("/api/subscription/session", async (c) => {
  const auth = serverAuth();
  const session = await auth.api.getSession({
    headers: c.req.header(),
  });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const user = session.user as ExtendedUser;
  if (user && user.stripeCustomerId != null) {
    const stripeCustomerId = user.stripeCustomerId;
    const stripeClient = StripeClient(c.env.STRIPE_SECRET_KEY);
    const stripeSession = await stripeClient.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${c.env.BETTER_AUTH_URL}/billing`,
    });
    return c.json({
      url: stripeSession.url,
      redirect: true,
    });
  }
  return c.json({ error: "Unauthorized" }, 401);
});

app.post("/api/api-key/create", async (c) => {
  const auth = serverAuth();
  const session = await auth.api.getSession({
    headers: c.req.header(),
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const jsonData = await c.req.json();
  const reqPermissions = jsonData.permissions;
  const reqName = jsonData.name || "test";
  const reqExpiresIn = jsonData.expiresIn || null;
  const validationResult = validatePermissions(reqPermissions);
  if (!validationResult.valid) {
    console.error(validationResult.error);
    if (validationResult.invalidPermissions) {
      console.error(
        "Invalid permissions:",
        validationResult.invalidPermissions,
      );
    }
    console.error("Invalid permissions");
  }

  const validatedPermissions = validationResult.permissions;

  // @ts-ignore
  const token = await auth.api.createApiKey({
    body: {
      name: reqName,
      expiresIn: reqExpiresIn,
      prefix: "fk_",
      remaining: 100,
      refillAmount: 100,
      refillInterval: 60 * 60 * 24 * 7, // 7 days
      rateLimitTimeWindow: 1000 * 60 * 60 * 24, // everyday
      rateLimitMax: 100, // every day, they can use up to 100 requests
      rateLimitEnabled: true,
      userId: session.user.id, // the user id to create the API key for
      permissions: validatedPermissions,
    },
  });

  return c.json(token);
});

export default app;
