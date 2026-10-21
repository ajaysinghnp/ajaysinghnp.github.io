---
description: "Use when creating or editing Next.js API route handlers, webhooks, or GitHub API integration."
applyTo: "app/api/**/route.ts"
---

# API route rules

- Export named HTTP method handlers (`GET`, `POST`) and return `NextResponse.json` with explicit status codes.
- Verify webhook signatures with `timingSafeEqual` as in `app/api/revalidate/route.ts`; reject before parsing the body.
- Read secrets from `process.env` inside the handler and return a generic error if missing; never log or echo values.
- Validate route params and query input; do not trust external API responses without checking their shape.
- Reuse `lib/github-content.ts` and `lib/github-config.ts` for GitHub access and revalidation tags.
