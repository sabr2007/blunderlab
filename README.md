# BlunderLab

> AI chess coach that turns your blunders into a personalized training plan.

[Live demo](https://blunderlab.vercel.app) · [Demo slot](https://blunderlab.vercel.app/en#demo) · [Submission one-pager](docs/submission.md) · [Demo script](docs/demo-script.md) · [Decisions log](docs/decisions.md)

Built for the **nFactorial Incubator 2026** application stage.

## The Problem

Most chess platforms tell you *what move was wrong*. They rarely help beginners understand *why the same mistake keeps repeating* or what to train next.

BlunderLab focuses on that gap after the game: review the critical moments, classify the thinking pattern, and leave the player with one concrete goal for the next match.

## What BlunderLab Does

1. Lets a player play against Stockfish in the browser.
2. Detects the critical moments where the evaluation changed.
3. Classifies each mistake into one of 8 blunder patterns.
4. Explains the mistake through BlunderLab Coach in EN or RU.
5. Turns old mistakes into Daily Blunder puzzles and progress tracking.

## Why This Is Different

BlunderLab is intentionally not a Chess.com or Lichess clone. The product value is the learning loop after a game: *Play → Review → Pattern → Train*.

The current landing includes a reserved empty slot for the future Remotion demo video. The video production itself is deferred and will be added later.

## Key Features

- Play vs Stockfish with legal move validation through `chess.js`.
- Post-game Review with Stockfish analysis and AI Coach explanations.
- 8-pattern blunder taxonomy: Hanging Piece, Missed Tactic, King Safety, Tunnel Vision, Greedy Move, Time Panic, Opening Drift, Endgame Technique.
- EN/RU locale routing through `next-intl`.
- Daily Blunder generated from the player’s own reviewed mistakes.
- Dashboard with top weakness, streak, recent reviews, and city rank.
- City leaderboard ranked by improvement, not rating.
- Pro waitlist and pricing teaser for the submission narrative.

## Tech Stack

Next.js 16 · TypeScript strict · Tailwind CSS v4 · Supabase Auth/Postgres/RLS · `chess.js` · `react-chessboard` · Stockfish WASM · OpenAI `gpt-4o-mini` with deterministic fallback templates · `next-intl` · Framer Motion · Vercel Analytics · Playwright · Vitest · Biome.

## Run Locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000/en`.

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
| `pnpm db:types` | Regenerate Supabase TypeScript types |

## Project Status

- Phase 1: playable foundation.
- Phase 2: review core.
- Phase 3: service layer.
- Phase 4: i18n, final landing, submission docs, SEO/social preview, analytics, error pages. Demo video is intentionally left as a landing placeholder for later Remotion production.

## For nFactorial Committee

- [Submission one-pager](docs/submission.md)
- [Demo script](docs/demo-script.md)
- [PRD](docs/PRD.md)
- [Design document](docs/design-document.md)
- [Decisions log](docs/decisions.md)

## Roadmap

KZ locale, Remotion demo video, multiplayer-by-link, weekly report email, shareable review cards, custom board skins, real Stripe checkout, and school/team coach dashboard.
