#!/bin/bash

set -e

echo "🔍 Checking if in Cloudflare Pages CI/CD environment..."

if [ "$CI" = "true" ]; then

  echo "📁 Copying wrangler.jsonc..."

  cp  ./wrangler.jsonc ./apps/web/wrangler.jsonc

  echo "📦 Applying D1 migrations..."
  pnpm run db:remote

  echo "🎉 Cloudflare setup complete!"
else
  echo "⏩ Skipping Cloudflare-specific setup (not in CF Pages CI/CD)"
fi