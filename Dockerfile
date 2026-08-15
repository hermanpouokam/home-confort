# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npx tsc --target ES2020 --module commonjs --moduleResolution node \
    --esModuleInterop --allowSyntheticDefaultImports \
    --outDir /tmp/seed-out prisma/seed.ts

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl vips-dev
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /tmp/seed-out/seed.js ./prisma/seed.js
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/i18n.ts ./i18n.ts

# Run migrations and seed at container start, then start server
CMD npx prisma@5.22.0 db push --accept-data-loss && node prisma/seed.js && node server.js