import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { EnvType } from "load-context";
import * as schema from "~/db/schema";

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
                requireEmailVerification:true,
                // resetPasswordTokenExpiresIn:300,
                sendResetPassword: async ({ user, url, token }, request) => {
                    console.log({ user, url, token }, request)
                }
            },
            emailVerification:{
                sendOnSignUp:true,
                sendVerificationEmail:async ({ user, token })=>{
                    const verificationUrl = `${env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${'/dashboard'}`;
                    console.log('{ user, token }',{ user, token },verificationUrl)
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