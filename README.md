# Flarekit

**Flarekit** is a modern full-stack SaaS starter kit built with **React Router v7**, **Better Auth**, **Hono**, and **Cloudflare Workers**. It helps you build and deploy SaaS apps faster with built-in authentication, Stripe billing, email integration, and a SQL database — all optimized for speed, scalability, and developer experience.

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
│   ├── auth/        # Auth client SDK
│   ├── ui/                 # Shared UI components (shadcn styled)
│   └── config-typescript/  # Typescript config files
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

# Copy and configure wrangler config
cp apps/web/wrangler.toml.example apps/web/wrangler.toml
# Edit the file with your secrets (auth, Stripe, DB, etc.)

# Initialize database
pnpm run db:generate
pnpm run db:push

# Run in dev mode
pnpm dev


# Push schema to your remote D1 database
pnpm db:remote

# Build the app
pnpm build

# Deploy
pnpm deploy

```

## 📜 License
This project is licensed under the MIT License.