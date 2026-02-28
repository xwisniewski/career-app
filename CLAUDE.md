# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Career Trajectory Intelligence App — a Next.js fullstack app that cross-references real-time macroeconomic signals with individual career profiles to generate personalized, AI-powered career guidance. Think "Bloomberg Terminal for your career."

Target users: small internal team (~5–15 people).

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript throughout
- **Database**: PostgreSQL via Prisma ORM (v7 — driver adapter model, uses `@prisma/adapter-pg`)
- **Auth**: NextAuth.js (credentials + optional OAuth)
- **Background Jobs**: Vercel Cron Jobs or node-cron; BullMQ + Redis for scraping queue
- **Scraping**: Playwright + Cheerio; fallback to RSS and public APIs
- **AI**: Anthropic Claude API — `claude-haiku` for signal categorization, `claude-sonnet` for recommendations
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts or Tremor
- **Deployment**: Vercel + Railway/Supabase for DB

---

## Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build
npm run build

# Database migrations
npx prisma migrate dev --name <migration-name>
npx prisma migrate deploy        # production
npx prisma generate              # regenerate client after schema change
npx prisma studio                # DB GUI

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Seed development DB with synthetic signals
npm run db:seed

# Trigger scraping manually (dev)
curl -X POST http://localhost:3000/api/scrape/run \
  -H "x-cron-secret: $SCRAPER_CRON_SECRET"
```

---

## Required Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ANTHROPIC_API_KEY=
REDIS_URL=
SCRAPER_CRON_SECRET=       # Protects cron endpoint
FRED_API_KEY=              # Free from FRED website
```

---

## Architecture

### App Router Structure

```
/app
  /onboarding        — Multi-step profile builder (5 steps, progress saved per step)
  /dashboard         — Main hub: signal feed (left), intelligence brief (center), quick actions (right)
  /recommendations   — Full AI recommendation report
  /signals           — Unfiltered macro signal explorer
  /profile           — Profile editor (changes trigger recommendation regen)
  /team              — Anonymized team aggregate view
  /admin             — Scrape status, signal counts, manual triggers (build early)
  /settings          — Notifications, privacy, preferences
  /api               — API routes (see below)
```

### Key API Routes

```
POST   /api/auth/[...nextauth]
GET    /api/profile
PUT    /api/profile
GET    /api/signals                 — paginated, filterable
GET    /api/signals/:id
GET    /api/recommendations/latest
POST   /api/recommendations/refresh — manual regen trigger
GET    /api/dashboard
GET    /api/team
POST   /api/scrape/run             — admin only, protected by SCRAPER_CRON_SECRET
GET    /api/scrape/status
```

### Critical Files / Directories

```
/lib/db.ts             — Prisma client singleton (PrismaPg adapter + global instance)
/lib/prompts.ts        — ALL Claude prompts live here (highest-leverage iteration point)
/lib/scrapers/         — One file per scraper, each implements the Scraper interface
/lib/scrapers/base.ts  — Scraper interface definition
/lib/signals.ts        — Signal processing: dedup, categorization, relevance scoring
/prisma/schema.prisma  — DB schema
/prisma/seed.ts        — Synthetic signal seed data for dev
/app/generated/prisma/ — Prisma 7 generated client (do not edit; import from /client subpath)
/prisma.config.ts      — Prisma 7 config (datasource URL, migration path)
```

**Prisma 7 notes**: Client is generated to `app/generated/prisma/client.ts` (not the default `@prisma/client`). Always import from `@/app/generated/prisma/client`. The `PrismaClient` constructor requires a driver adapter — see `lib/db.ts`. Run `npx prisma generate` after any schema change.

### Scraper Interface

Every scraper must implement:

```ts
interface Scraper {
  name: string;
  run(): Promise<RawSignal[]>;
  parseSignal(raw: RawSignal): MacroSignal;
}
```

Scrapers are orchestrated by a `ScrapingOrchestrator` that runs on a daily cron at 2am UTC. Failed scrapes go to a BullMQ retry queue. All runs are logged with success/failure status.

### AI Integration Pattern

Two Claude calls, separated by concern:

1. **Signal Categorization** (`claude-haiku`): After scraping, extract category, relevant industries/roles/skills, sentiment, magnitude, and a clean headline from raw content. High volume, cheap.

2. **Recommendation Generation** (`claude-sonnet`): Full user profile + top 50 relevant signals → structured `CareerRecommendation` JSON. Cache aggressively — only regenerate on: new matching signals, profile update, or manual refresh.

Prompts for both must live in `/lib/prompts.ts` only. Prompts must enforce opinionated stances (not hedged), specific names (not generalities), and reasoning tied to specific signals.

---

## Data Models (Summary)

Two core domain types drive everything:

- **`MacroSignal`** — scraped signal with source, category, topic, headline, data point, sentiment, magnitude, relevant industries/roles/skills, and source URL.
- **`CareerRecommendation`** — AI-generated per-user: skills to accelerate/deprioritize/watch, roles to target/avoid, industries to move toward/avoid, income trajectory assessment, positioning statement, and IDs of signals used.

The **`UserProfile`** captures: current role/industry/experience, primary/learning/desired skills, target roles/industries/income/time horizon, risk tolerance, autonomy vs. status preference, geographic flexibility, family constraints, visa status, network strength by industry, and learning capacity.

Use Prisma migrations from day one — the schema will evolve frequently.

---

## MVP Build Order

Build in this order to get end-to-end working fast:

1. Auth + user profile onboarding (5-step flow)
2. FRED API + BLS API (free, reliable, no scraping complexity)
3. Layoffs.fyi RSS + HN Hiring RSS (easy, high-signal)
4. Signal storage + categorization pipeline (Claude Haiku)
5. Recommendation generation (Claude Sonnet) with hardcoded signal set for testing
6. Dashboard + Recommendations pages
7. LinkedIn/Indeed scraping (most brittle — save for post-MVP)
8. Team view + notifications (polish layer)

---

## Development Notes

- **Build `/admin` early.** You'll need scrape status, signal counts, user list, and manual trigger buttons constantly during development.
- **Seed the DB** with synthetic signals so you can develop the UI without waiting for real scraping runs. Keep seed data realistic.
- **Scrapers fail gracefully.** Log clearly so broken scrapers are easy to spot and fix. Store raw HTML alongside parsed signals for re-parsing without re-scraping.
- **Scraping ethics**: Respect `robots.txt`. LinkedIn blocks aggressively — use their Jobs RSS or a proxy service (ScraperAPI, BrightData). All scrapers need randomized delays and rotating user agents. Use RSS feeds before full HTML scraping where available (Layoffs.fyi, HN, GitHub Trending all have RSS).
- **Income goal is a through-line.** It must appear in all AI-generated advice — not just the income trajectory section.
