import type { Context } from 'hono'
import type { PlatformProxy } from 'wrangler'

export type EnvType = {
  MY_VAR: string
  DB: D1Database
  BETTER_AUTH_URL: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  RESEND_API_KEY: string
  MY_BUCKET: R2Bucket
}


type Env = {
  Bindings: EnvType
  Variables: {
    MY_VAR_IN_VARIABLES: string
  }
}

type GetLoadContextArgs = {
  request: Request
  context: {
    cloudflare: Omit<PlatformProxy<Env['Bindings']>, 'dispose' | 'caches' | 'cf'> & {
      caches: PlatformProxy<Env>['caches'] | CacheStorage
      cf: Request['cf']
    }
    hono: {
      context: Context<Env>
    }
  }
}

declare module 'react-router' {
  interface AppLoadContext extends ReturnType<typeof getLoadContext> {
    // This will merge the result of `getLoadContext` into the `AppLoadContext`
    extra: string
    hono: {
      context: Context<Env>
    }
  }
}

export function getLoadContext({ context }: GetLoadContextArgs) {
  return {
    ...context,
    extra: 'stuff',
  }
}
