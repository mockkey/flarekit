# Flarekit

**Flarekit** 是一个现代的全栈 SaaS 启动模板，基于 **React Router v7**、**Better Auth**、**Hono** 和 **Cloudflare Workers** 构建。它内置了用户认证、Stripe 支付、邮件发送功能和 SQL 数据库，帮助你更快地构建和部署 SaaS 应用，兼顾速度、可扩展性和开发者体验。

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mockkey/flarekit)


🌐 [在线演示](https://flarekit.mockkey.com/)



## 🚀 技术栈

- **前端框架**：React + React Router v7  
- **用户认证**：Better Auth  
- **后端 API**：Hono（基于 Cloudflare Workers）  
- **数据库**：Cloudflare D1 + Drizzle ORM  
- **支付功能**：Stripe  
- **邮件服务**：Resend  
- **包管理工具**：pnpm  
- **开发语言**：TypeScript  
- **UI 组件库**：shadcn/ui（基于 Tailwind CSS v4）


## 📦 项目结构（Monorepo）

```
├── apps/
│   └── web/              # Main web frontend
├── packages/
│   ├── auth/        # Auth client SDK
│   ├── ui/                 # Shared UI components (shadcn styled)
│   └── config-typescript/  # Typescript config files
```

### 文件夹说明

- `apps/`：包含所有可部署的应用（如 Web 前端）
- `packages/`：包含可复用的逻辑或模块（如 auth SDK、UI 组件、TS 配置）
- `.github/`：GitHub CI/CD 工作流文件
- `/apps/web/wrangler.toml`：Cloudflare Workers 的配置文件（包括环境变量、路由设置等）




## 🛠️ 快速开始

```bash
# 克隆项目
git clone https://github.com/mockkey/flarekit.git
cd flarekit

#  安装依赖
pnpm install



# 配置 Wrangler 和环境 
cp  ./wrangler.jsonc ./apps/web/wrangler.jsonc


# 进入 Web 应用目录：
cd apps/web

#创建 Cloudflare 资源：
npx wrangler d1 create flare-d1
npx wrangler kv namespace create APP_KV
npx wrangler r2 bucket create flarekit
npx wrangler queues create thumbnails

# 请在 wrangler.toml 中添加你的 secret，例如：auth、Stripe、D1 等配置。



# 数据库初始化
pnpm run db:generate
pnpm run db:local

# 本地开发
pnpm dev


# 推送 schema 到远程 D1：
pnpm db:remote

# 构建项目
pnpm build

# 部署到 Cloudflare
pnpm deploy

```


## 🛠️ 设置R2 CORS  

更具自己的网址替换AllowedOrigins内容防止跨域

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