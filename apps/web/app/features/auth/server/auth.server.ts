import { stripe } from "@better-auth/stripe";
import { ResetPasswordEmail, WelcomeEmail } from "@flarekit/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, createAuthMiddleware } from "better-auth/plugins";
import { Resend } from "resend";
import { hashPassword, verifyPassword } from "../crypto.server";
import { StripeClient } from "./stripe";
let _auth: ReturnType<typeof betterAuth>;
import { env } from "cloudflare:workers";
import { StorageService } from "server/services/storage-service";
import { db } from "~/db/db.server";
import { user as userSchema } from "~/db/schema";

export const serverAuth = () => {
  const stripeClient = StripeClient(env.STRIPE_SECRET_KEY!);
  if (!_auth) {
    _auth = betterAuth({
      baseUrl: env.BETTER_AUTH_URL,
      trustedOrigins: [env.BETTER_AUTH_URL],
      database: drizzleAdapter(db, {
        provider: "sqlite",
      }),
      secondaryStorage: {
        get: async (key) => {
          return await env.APP_KV.get(`_auth:${key}`, "json");
        },
        set: async (key, value, ttl) => {
          return await env.APP_KV.put(`_auth:${key}`, JSON.stringify(value), {
            expirationTtl: ttl,
          });
        },
        delete: async (key) => {
          return await env.APP_KV.delete(`_auth:${key}`);
        },
      },
      rateLimit: {
        enabled: true,
        storage: "secondary-storage",
        window: 60,
        max: 10,
      },
      emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
          const resend = new Resend(env.RESEND_API_KEY);
          await resend.emails.send({
            from: "Flarekit <reset@mockkey.com>",
            to: [user.email],
            subject: "Reset Your Password",
            react: ResetPasswordEmail({
              username: user.name,
              resetUrl: url,
            }),
          });
        },
        password: {
          hash: async (password) => {
            return await hashPassword(password);
          },
          verify: async ({ hash, password }) => {
            return await verifyPassword({ hash, password });
          },
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, token }) => {
          if (env.ADMIN_EMAIL === user.email) {
            await db.update(userSchema).set({
              emailVerified: true,
            });
          } else {
            const verificationUrl = `${
              env.BETTER_AUTH_URL
            }/api/auth/verify-email?token=${token}&callbackURL=${"/dashboard"}`;
            const resend = new Resend(env.RESEND_API_KEY);
            await resend.emails.send({
              from: "Flarekit <welcome@mockkey.com>",
              to: [user.email],
              subject: "welcome",
              react: WelcomeEmail({
                username: user.name,
                verifyUrl: verificationUrl,
              }),
            });
          }
        },
      },
      socialProviders: {
        github: {
          clientId: env.GITHUB_CLIENT_ID || "",
          clientSecret: env.GITHUB_CLIENT_SECRET || "",
        },
      },
      user: {
        deleteUser: {
          enabled: true,
          afterDelete: async () => {},
        },
      },
      account: {
        accountLinking: {
          enabled: true,
          allowDifferentEmails: true,
          trustedProviders: ["github"],
        },
      },
      plugins: [
        stripe({
          stripeClient,
          stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET!,
          createCustomerOnSignUp: false,
          onEvent: async (event) => {
            // Handle any Stripe event
            console.log("event", event.type);
            switch (event.type) {
              case "invoice.paid":
                // Handle paid invoice
                break;
              case "payment_intent.succeeded":
                // Handle successful payment
                break;
              case "customer.subscription.updated":
                break;
            }
          },
          subscription: {
            enabled: true,
            plans: [
              {
                name: "pro",
                priceId: env.STRIPE_PRICE_ID,
                freeTrial: {
                  days: 7,
                },
              },
            ],
          },
        }),
        apiKey({
          apiKeyHeaders: ["x-api-key"],
          enableMetadata: true,
          permissions: {
            defaultPermissions: async (_userId, _ctx) => {
              return {
                files: ["read"],
                users: ["read"],
              };
            },
          },
        }),
      ],
      hooks: {
        after: createAuthMiddleware(async (ctx) => {
          if (ctx.path.startsWith("/sign-up")) {
            const newSession = ctx.context.newSession;
            if (newSession) {
              const userId = newSession.user.id;
              await StorageService.initializeUserStorage(userId);
            }
          }
        }),
      },
    });
  }

  return _auth;
};
