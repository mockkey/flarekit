# React Router v7 with Better Auth

Build an app template for React Router v7 and Better Auth and Hono to run on Cloudflare Workers.

## Stack

- Authentication:Better auth
- ORM: Drizzle
- DB: D1
- Framework: Hono and rr7
- Language: TypeScript
- Package Manager: pnpm
- payment: stripe



## Getting Started

Install the dependencies:

```bash
git clone https://github.com/panwenwei/cloudflare-workers
pnpm install
```


### Modify config


```toml
// wrangler.toml
[vars]
MY_VAR = "My Value"
BETTER_AUTH_SECRET = ""
BETTER_AUTH_URL = ""
GITHUB_CLIENT_ID = ""
GITHUB_CLIENT_SECRET = ""
RESEND_API_KEY = ""
IMAGE_URL = ""
STRIPE_SECRET_KEY = ""
STRIPE_WEBHOOK_SECRET = ""
STRIPE_PRICE_ID = ""

[[d1_databases]]
binding = "DB"
database_name = ""
database_id = ""
migrations_dir = "drizzle"

[[r2_buckets]]
  bucket_name = "flarekit"
  binding = "MY_BUCKET"

```



### Development

```bash
pnpm run db:generate
pnpm run db:local

```

```bash
pnpm run dev
```

### deploy

```bash
pnpm run deploy
```
