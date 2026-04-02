# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| main    | ✓         |

## Reporting a Vulnerability

If you discover a security vulnerability, please do **not** open a public GitHub issue.

Instead, report it by emailing the repository maintainer directly. Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Any suggested mitigations

You should receive a response within 48 hours. If the vulnerability is confirmed, a fix will be prioritized and a patch released as quickly as possible.

## Security Practices

- **Secrets**: All secrets are stored in environment variables, never in source code. See `.env.example` for required variables.
- **Authentication**: NextAuth.js handles session management with NEXTAUTH_SECRET rotation support.
- **Database**: Parameterized queries via Prisma ORM — no raw SQL string interpolation.
- **Scraping endpoints**: Protected by `SCRAPER_CRON_SECRET` header validation.
- **Rate limiting**: Applied to all public API routes.
- **Input validation**: Zod schemas validate all user input at API boundaries.
- **Dependencies**: Keep dependencies up to date; run `npm audit` regularly.

## Environment Variables

Never commit `.env` or `.env.local` files. Required secrets:

```
DATABASE_URL
NEXTAUTH_SECRET
ANTHROPIC_API_KEY
REDIS_URL
SCRAPER_CRON_SECRET
FRED_API_KEY
```
