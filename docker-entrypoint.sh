#!/bin/sh
set -e

echo "⏳ Applying database schema..."
npx prisma@5.22.0 db push --accept-data-loss

echo "🌱 Running seed..."
node prisma/seed.js || echo "⚠️  Seed skipped (already seeded or error)"

echo "🚀 Starting Next.js..."
exec node server.js