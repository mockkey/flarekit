import { Hono } from "hono";
import type { HonoEnv, User } from "load-context";
import { StripeClient } from "~/features/auth/server/stripe";

export const subscriptionServer = new Hono<HonoEnv>();

interface ExtendedUser extends User {
  stripeCustomerId?: string;
}

subscriptionServer.post("/session", async (c) => {
  const user = c.get("user") as ExtendedUser;
  if (user.stripeCustomerId != null) {
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
