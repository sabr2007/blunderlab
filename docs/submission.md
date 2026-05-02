# BlunderLab — Submission One-Pager

## Product

BlunderLab is an AI chess coach that turns post-game blunders into a clear training loop: **Play → Review → Pattern → Train**.

## Problem

Beginners often see engine feedback like “blunder” or “best move,” but they do not understand the thinking habit behind the mistake. That makes review feel informational but not actionable.

## Solution

BlunderLab analyzes a game with Stockfish, selects the critical moments, classifies each mistake into one of 8 thinking patterns, and uses BlunderLab Coach to explain the mistake in plain EN/RU language. The player leaves with one training goal for the next game.

## Current Demo Scope

- EN/RU localized app routes.
- Final landing page with product narrative and empty reserved demo-video slot.
- Play vs Stockfish.
- Review pipeline with deterministic fallback if OpenAI is unavailable.
- Dashboard, Daily Blunder, leaderboard, settings, and Pro waitlist.
- Vercel Analytics, OG/Twitter preview, sitemap, robots, and localized error pages.

## Demo Video Status

The landing keeps the demo-video area intentionally empty. The video will be produced later through Remotion; no Remotion project or generated video is included in this phase execution.

## Links

- Live URL: `https://blunderlab.vercel.app`
- GitHub: `https://github.com/sabr2007/blunderlab`
- Decisions: [`docs/decisions.md`](./decisions.md)
- PRD: [`docs/PRD.md`](./PRD.md)
- Demo script: [`docs/demo-script.md`](./demo-script.md)

## Roadmap

KZ locale, Remotion demo video, multiplayer-by-link, weekly report email, shareable review cards, custom board skins, real checkout, and school/team coach dashboard.
