# React Router v7 with Better Auth

Build an app template for React Router v7 and Better Auth and Hono to run on Cloudflare Workers.

## Stack

- Authentication:Better auth
- ORM: Drizzle
- DB: D1
- Framework: Hono and rr7
- Language: TypeScript
- Package Manager: pnpm



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

[[d1_databases]]
binding = "DB"
database_name = ""
database_id = ""
migrations_dir = ""

```



### Development

```bash
pnpm  db:generate
pnpm  db:local

```

```bash
pnpm  dev
```

### deploy

```bash
pnpm deploy
```
