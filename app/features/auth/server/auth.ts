import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { EnvType } from "load-context";
import * as schema from "~/db/schema";
import WelcomeEmail from "~/features/email/components/wecome";
import { Resend } from 'resend';
import ResetPasswordEmail from "~/features/email/components/reset-password";

let _auth: ReturnType<typeof betterAuth>

export const serverAuth =  (env:EnvType) =>{
    const db = drizzle(env.DB, { schema })
    if (!_auth) {
        _auth = betterAuth({
            baseUrl: env.BETTER_AUTH_URL,
            trustedOrigins: [env.BETTER_AUTH_URL],
            
            database: drizzleAdapter(db, {
                provider: "sqlite",
            }),
            emailAndPassword: {  
                enabled: true,
                autoSignIn:true,
                requireEmailVerification:false,
                sendResetPassword: async ({ user, url }) => {
                    const resend = new Resend(env.RESEND_API_KEY)
                    const { data, error } = await resend.emails.send({
                        from: 'Acme <onboarding@mockkey.com>',
                        to: [user.email],
                        subject: 'Reset Your Password',
                        react: ResetPasswordEmail({
                            username: user.name,
                            resetUrl: url
                        })
                    })
                }
            },
            emailVerification:{
                sendOnSignUp:true,
                sendVerificationEmail:async ({ user, token })=>{
                    const verificationUrl = `${env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${'/dashboard'}`;
                    const resend = new Resend(env.RESEND_API_KEY)
                    const { data, error } = await  resend.emails.send({
                        from: 'Acme <onboarding@mockkey.com>',
                        to: [user.email],
                        subject: 'welcome',
                        react: WelcomeEmail({
                            username:user.name,
                            verifyUrl:verificationUrl
                        }),
                    })
                }
            },
            socialProviders:{
                github: {
                    clientId: env.GITHUB_CLIENT_ID || "",
                    clientSecret: env.GITHUB_CLIENT_SECRET || "",
                }
            }
        })
    }

    return _auth
}