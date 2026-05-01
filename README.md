# BlunderLab

> AI chess coach that turns every blunder into your next training plan.

Built for the **nFactorial Incubator 2026** application stage.

BlunderLab is intentionally **not** a Chess.com or Lichess clone. The product gap it targets is the moment _after_ a game: beginners see "this was a blunder" but rarely understand the thinking pattern that caused it. BlunderLab closes that loop with a focused review — three critical moments, one repeating pattern, one goal for the next match.

## Documents

- [`docs/PRD.md`](./docs/PRD.md) — product requirements, audience, gap analysis.
- [`docs/design-document.md`](./docs/design-document.md) — visual system and screen specs.
- [`docs/decisions.md`](./docs/decisions.md) — **source of truth** for stack, palette, taxonomy, formulas.
- [`docs/CJM.md`](./docs/CJM.md) — customer journey map.

## Stack (locked — see `docs/decisions.md`)

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Supabase** (Postgres + Auth + RLS)
- **chess.js** + **react-chessboard** + **stockfish.wasm** (Web Worker)
- **OpenAI gpt-4o-mini** for coach explanations, with deterministic templates as fallback
- **next-intl** (EN + RU at MVP)
- **Biome** for lint/format, **Vitest** + **Playwright** for tests
- Deployed on **Vercel**

## Run locally

```bash
pnpm install
cp .env.example .env.local       # fill in Supabase + OpenAI keys
pnpm dev                         # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript without emit |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format write |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm db:types` | Regenerate Supabase TypeScript types from the linked project |

## Roadmap

Phases are in `docs/decisions.md` §10. Current phase: **Phase 3 — service layer (initial pass)**.

Implemented surfaces:

- `/play` and `/review/[gameId]` — anonymous Play → Review loop from Phases 1–2.
- `/sign-in` and `/auth/callback` — Google OAuth / email magic-link entry points.
- `/onboarding` — skill level and city setup.
- `/dashboard`, `/daily-blunder`, `/leaderboard`, `/settings` — authed retention loop.
- `/pro` — pricing tiers and waitlist capture.
- `/api/cron/leaderboard-snapshot` — Vercel Cron endpoint for city snapshots.

## Why this product

> I intentionally did not try to clone Chess.com or Lichess. Instead I focused on one product gap: beginners often receive engine feedback but do not understand how to convert it into a learning loop. BlunderLab is built around that loop.
