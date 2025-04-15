import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { EnvType } from "load-context";
import * as schema from "~/db/schema";
import WelcomeEmail from "~/features/email/components/wecome";
import { Resend } from "resend";
import ResetPasswordEmail from "~/features/email/components/reset-password";
import { stripe } from "@better-auth/stripe";
import { StripeClient } from "./stripe";
import { apiKey } from "better-auth/plugins"
let _auth: ReturnType<typeof betterAuth>;


export const serverAuth = (env: EnvType) => {
  const stripeClient = StripeClient(env.STRIPE_SECRET_KEY!);
  const db = drizzle(env.DB, { schema });
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
          const { data, error } = await resend.emails.send({
            from: "Flarekit <reset@mockkey.com>",
            to: [user.email],
            subject: "Reset Your Password",
            react: ResetPasswordEmail({
              username: user.name,
              resetUrl: url,
            }),
          });
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, token }) => {
          const verificationUrl = `${
            env.BETTER_AUTH_URL
          }/api/auth/verify-email?token=${token}&callbackURL=${"/dashboard"}`;
          const resend = new Resend(env.RESEND_API_KEY);
          const { data, error } = await resend.emails.send({
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
        },
      },
      account: {
        accountLinking: {
          enabled: true,
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
            console.log('event',event.type)
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
          
        })
      ],
    });
  }

  return _auth;
};
