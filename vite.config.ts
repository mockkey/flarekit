// vite.config.ts
import adapter from '@hono/vite-dev-server/cloudflare'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from "@tailwindcss/vite"
import { cloudflareDevProxy as remixCloudflareDevProxy } from '@react-router/dev/vite/cloudflare'
import serverAdapter from 'hono-react-router-adapter/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { getLoadContext } from './load-context'

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(),
    tailwindcss(),
    reactRouter(),
    serverAdapter({
      adapter,
      getLoadContext,
      entry: 'server/index.ts',
    }),
    tsconfigPaths(),
  ],
})
