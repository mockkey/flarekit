import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey } from "better-auth/plugins";
import { Resend } from "resend";
import ResetPasswordEmail from "~/features/email/components/reset-password";
import WelcomeEmail from "~/features/email/components/wecome";
import { hashPassword, verifyPassword } from "../crypto.server";
import { StripeClient } from "./stripe";
let _auth: ReturnType<typeof betterAuth>;
import { env } from "cloudflare:workers";
import { db } from "~/db/db.server";

export const serverAuth = () => {
  const stripeClient = StripeClient(env.STRIPE_SECRET_KEY!);
  if (!_auth) {
    _auth = betterAuth({
      baseUrl: env.BETTER_AUTH_URL,
      trustedOrigins: [env.BETTER_AUTH_URL],
      database: drizzleAdapter(db, {
        provider: "sqlite",
      }),
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
        additionalFields: {
          theme: {
            type: "string",
            required: false,
            defaultValue: "null",
          },
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
    });
  }

  return _auth;
};
