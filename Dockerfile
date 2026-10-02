# ================================
# DOCKERFILE - TAPPYIMOB NEXT.JS
# Multi-stage build para produção
# ================================

FROM node:20-alpine AS base

# Instalar dependências apenas quando necessário
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Instalar dependências
RUN pnpm install --frozen-lockfile && mkdir -p /app/node_modules/@img

# ================================
# BUILD
# ================================
FROM base AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Args para build (Next.js precisa das env vars durante build)
ARG DATABASE_URL
ARG OPENAI_API_KEY
ARG DEEPSEEK_API_KEY
ARG DEEPSEEK_API_BASE_URL
ARG DEEPSEEK_MODEL
ARG XAI_API_KEY
ARG BLOB_READ_WRITE_TOKEN
ARG MINIO_ENDPOINT
ARG MINIO_ROOT_USER
ARG MINIO_ROOT_PASSWORD
ARG MINIO_BUCKET
ARG MINIO_PUBLIC_URL

ENV DATABASE_URL=${DATABASE_URL}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
ENV DEEPSEEK_API_BASE_URL=${DEEPSEEK_API_BASE_URL}
ENV DEEPSEEK_MODEL=${DEEPSEEK_MODEL}
ENV XAI_API_KEY=${XAI_API_KEY}
ENV BLOB_READ_WRITE_TOKEN=${BLOB_READ_WRITE_TOKEN}
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}
ENV MINIO_ROOT_USER=${MINIO_ROOT_USER}
ENV MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
ENV MINIO_BUCKET=${MINIO_BUCKET}
ENV MINIO_PUBLIC_URL=${MINIO_PUBLIC_URL}

# Gerar Prisma Client e build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm prisma generate
RUN pnpm build

# ================================
# PRODUCTION
# ================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Dependências nativas para sharp no Alpine + Chromium para geração de PDF
# (puppeteer-core aponta para o Chromium do sistema via PUPPETEER_EXECUTABLE_PATH).
RUN apk add --no-cache \
    libc6-compat \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Copiar build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar sharp e binários nativos (necessário para OG image generation)
COPY --from=deps /app/node_modules/sharp ./node_modules/sharp
COPY --from=deps /app/node_modules/@img ./node_modules/@img

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
