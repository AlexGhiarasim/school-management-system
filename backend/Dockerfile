# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app

# Install every dependency. The Prisma client is generated while installing,
# which needs a database URL but never connects to it.
FROM base AS deps
ENV DATABASE_URL=mysql://build:build@localhost:3306/build
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run prisma:generate && npm run build

# Image with the Prisma CLI and the seed script, used to migrate and seed.
# The Prisma migration engine needs OpenSSL, which Alpine does not include.
FROM build AS tools
RUN apk add --no-cache openssl
CMD ["npx", "prisma", "migrate", "deploy"]

FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1
CMD ["node", "dist/main.js"]
