# Flarekit

**Flarekit** is a modern full-stack SaaS starter kit built with **React Router v7**, **Better Auth**, **Hono**, and **Cloudflare Workers**. It helps you build and deploy SaaS apps faster with built-in authentication, Stripe billing, email integration, and a SQL database — all optimized for speed, scalability, and developer experience.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mockkey/flarekit)


🌐 [Live Demo](https://flarekit.mockkey.com/)

English | [简体中文](./README-zh_CN.md) 

## 🚀 Tech Stack

- **Frontend Framework**: React + React Router v7
- **Authentication**: Better Auth
- **Backend API**: Hono (Cloudflare Workers)
- **Database**: Cloudflare D1 + Drizzle ORM
- **Payments**: Stripe
- **Email API**: Resend
- **Package Manager**: pnpm
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Tailwind CSS v4)



## 📦 Monorepo Structure

```
├── apps/
│   └── web/              # Main web frontend
├── packages/
│   ├── auth/             # Authentication client SDK
│   ├── ui/               # Shared UI components (shadcn styled)
│   ├── config-typescript/  # TypeScript configuration files
│   ├── email/            # React email templates for transactional emails
│   ├── db/               # Database schema definitions and client setup
│   └── file-manager/     # Frontend components, hooks, and utilities for file and folder management
```

### Folder Overview

- `apps/`: All deployable applications (frontend, backend if needed).
- `packages/`: Reusable logic/modules (auth clients, shadcn/ui , tsconfig).
- `.github/`: CI/CD workflows.
- `/apps/web/wrangler.toml`: Configuration for Cloudflare Workers (env vars, routing, etc.).




## 🛠️ Getting Started

```bash
# Clone the project
git clone https://github.com/mockkey/flarekit.git
cd flarekit


# Install dependencies
pnpm install

# Copy wrangler.jsonc
cp  ./wrangler.jsonc ./apps/web/wrangler.jsonc

# Navigate to the web app directory:
cd apps/web

#Create Cloudflare resources:
npx wrangler d1 create flare-d1
npx wrangler kv namespace create APP_KV
npx wrangler r2 bucket create flarekit
npx wrangler queues create thumbnails

# Be sure to update wrangler.toml with your secrets (auth keys, Stripe keys, D1 DB name, etc.)


# Generate and run database locally:
pnpm run db:generate
pnpm run db:local

# Run in dev mode
pnpm dev


# Push schema to the remote D1 instance:
pnpm db:remote

# Build the app
pnpm build

# Deploy
pnpm deploy

```

## 🛠️ Setting R2  CORS


```r2
    [
  {
    "AllowedOrigins": [
      "*"
    ],
    "AllowedMethods": [
      "PUT",
      "GET",
      "HEAD",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```




## 📜 License
This project is licensed under the MIT License.