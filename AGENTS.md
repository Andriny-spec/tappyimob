# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**Tappy Imob** — full-stack real estate CRM and listing platform for the Sua Cidade/SP market. Built as a Next.js 16 monolith (App Router, TypeScript, React 19) with a PostgreSQL backend managed by Prisma ORM. O aplicativo Android/iOS e um projeto React Native separado que consome esta API (ver `md/aplicativo.md`).

Two main surfaces:
- **Public portal**: property listings, blog, calculators, contact forms, partner/condominium pages.
- **Admin CRM** (`/admin`): leads, brokers, finance, marketing, AI, photography, storage, WhatsApp, integrations.

## Commands

```bash
pnpm dev                # Start Next.js dev server
pnpm build              # prisma generate && next build (standalone output)
pnpm start              # Start production server
pnpm lint               # ESLint

pnpm prisma db push     # Apply schema changes (no migrations — uses db push)
pnpm prisma generate    # Regenerate Prisma client
pnpm db:seed            # Run prisma/seed.ts
pnpm db:studio          # Open Prisma Studio

pnpm instagram:sync     # Sync Instagram posts via Apify
```

**No test suite exists.** There are no Jest, Vitest, or Playwright configs.

**`typescript.ignoreBuildErrors: true`** in `next.config.ts` — TypeScript errors do not block builds.

## Architecture

### Stack
- **Framework**: Next.js 16 App Router, React 19, TypeScript 5
- **Styling**: TailwindCSS 4 + Radix UI + custom Shadcn-style components in `/src/components/ui/`
- **Database**: PostgreSQL 16 via Prisma 7 + `@prisma/adapter-pg` (connection pool)
- **Auth**: Custom JWT with `jose` + bcryptjs. Cookie-based sessions (7-day). Roles: `ADMIN`, `CORRETOR`, `CLIENTE`, `FOTOGRAFO`, `SDR`. No NextAuth.
- **Server state**: TanStack React Query v5 in admin pages
- **Storage**: MinIO (primary, self-hosted S3) + Vercel Blob (fallback)
- **Email**: Resend (transactional) + Mailcow (self-hosted SMTP)
- **WhatsApp**: WAHA self-hosted on port 9000
- **AI**: OpenAI, DeepSeek (configurable via `DEEPSEEK_MODEL`), xAI (Grok)
- **Mobile**: app React Native (Expo) em repositorio proprio, consome as rotas `/api/*` deste projeto. Spec e checklist em `md/aplicativo.md`

### Request Flow

1. `middleware.ts` runs on every request:
   - Social media crawlers → rewrite to `/api/crawler` for OG-tag HTML
   - Maintenance mode → checks `/api/maintenance/status`, redirects to `/manutencao`
2. **Public Server Components** (`page.tsx`, property pages) call Prisma directly and pass data as props.
3. **Admin Client Components** use React Query to fetch from `/api/admin/*` routes.
4. **API Routes** (`/src/app/api/`) validate sessions via `getSession()` (JWT cookie), run Prisma queries, return JSON.
5. **Property data** originates from Tecimob (~7,500 properties) and is synced via Python scripts in `/scripts/`.

### Key Directories

```
/src/app/admin/         # CRM modules: leads, imoveis, financeiro, fotografos, sdr, etc.
/src/app/api/           # API route handlers
/src/app/imoveis/       # Public property listing pages
/src/components/admin/  # Admin UI: Sidebar, Topbar, Kanban, lead/property components
/src/components/ui/     # Base UI primitives
/src/lib/               # Server utilities: auth, prisma, waha, minio, resend, enrichment
/src/providers/         # React context: auth, theme, QueryClient, platform
/src/hooks/             # useLeads, useTracking, useFollowUpDays
/prisma/schema.prisma   # Full DB schema (~90 models, 4050 lines)
/scripts/               # Tecimob sync scripts (Python)
```

### Data Models (key Prisma models)

- **Lead CRM**: `Lead`, `LeadTag`, `LeadQueue` (round-robin), `LeadQueueMember`, `LeadDuplicate`, `LeadAutomation`, `LeadEnrichment`, `LeadFollowUp`, `KanbanColumn`
- **Properties**: `Property` synced from Tecimob
- **Users/Roles**: `User` with role enum; `Broker` for broker-specific data
- **Photography**: `PhotoSession`, `PhotoSessionSlot`, `PhotoSessionMedia`
- **Finance**: `Comissao`, `Meta`
- **Multi-site**: `Partner`, `PartnerDomain`, `PartnerPermission`, `PartnerFunnel`
- **Tasks**: `Tarefa`
- **Blog**: `BlogPost`

## Deploy

Produção roda em Docker Compose (`docker-compose.prod.yml`: app, PostgreSQL e MinIO) atrás de Nginx com HTTPS. Passo a passo de infraestrutura no `README.md` (capítulos 8 e 10). Acesso a servidores e credenciais ficam fora do repositório.

## Important Warnings

- **Never run `prisma migrate reset`** — it drops all production data.
- **Never run `DROP DATABASE`** — production DB has live client data.
- **Use `pnpm prisma db push`** for schema changes — never `prisma migrate dev`.
- **Use `pnpm prisma generate`** after schema changes to regenerate the client.
- `prisma/schema.prisma` is the single source of truth; the DB is managed schema-push style, not migration-file style.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
