# CareerApp — Project Memory

## Overview
Career Trajectory Intelligence App — "Bloomberg Terminal for your career."
Cross-references macro signals with user career profiles to generate AI-powered, personalized guidance.
Small internal team (~5–15 users).

## Stack
- Next.js 15 (App Router), TypeScript
- PostgreSQL via Prisma ORM v7 (`@prisma/adapter-pg`)
- NextAuth.js (credentials + optional OAuth)
- BullMQ + Redis for scraping queue
- Playwright + Cheerio for scraping
- Claude API: haiku for signal categorization, sonnet for recommendations
- Tailwind CSS + shadcn/ui

## Key Files
- `/lib/prompts.ts` — ALL Claude prompts (never put prompts elsewhere)
- `/lib/db.ts` — Prisma client singleton
- `/lib/scrapers/` — one file per scraper, all implement Scraper interface
- `/prisma/schema.prisma` — DB schema
- `/app/generated/prisma/client.ts` — generated client (import from `@/app/generated/prisma/client`)

## Prisma v7 Note
Always import from `@/app/generated/prisma/client`, not `@prisma/client`.
`PrismaClient` constructor requires a driver adapter — see `lib/db.ts`.

## MVP Build Order
1. Auth + onboarding → 2. FRED/BLS APIs → 3. RSS feeds → 4. Signal pipeline → 5. Recs → 6. Dashboard → 7. LinkedIn scraping → 8. Team view

## Recent Decisions
- **Threat Level feature**: Personal economic threat score grounded in Anthropic Economic Index data (HuggingFace dataset `Anthropic/EconomicIndex`, occupation-level "Observed Exposure" scores).
- Branding: **Trajectory.io**
