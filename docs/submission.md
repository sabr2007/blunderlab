# BlunderLab — Submission One-Pager

## Product

BlunderLab is an AI chess coach that turns post-game blunders into a clear training loop: **Play → Review → Pattern → Train**.

## Problem

Beginners often see engine feedback like “blunder” or “best move,” but they do not understand the thinking habit behind the mistake. That makes review feel informational but not actionable.

## Solution

BlunderLab analyzes a game with Stockfish, selects the critical moments, classifies each mistake into one of 8 thinking patterns, and uses BlunderLab Coach to explain the mistake in plain EN/RU language. The player leaves with one training goal for the next game.

## Current Demo Scope

- EN/RU localized app routes.
- Landing page with product narrative and an in-laptop demo video (per locale).
- Play vs Stockfish, accessible to fresh visitors as a guest with no sign-in detour.
- Review pipeline with deterministic fallback if OpenAI is unavailable.
- Dashboard, Daily Blunder (real-auth gated), leaderboard, settings, training modes, and Pro waitlist.
- Training Goal continuity from Review back into the next game.
- Chess for Builders landing variant for the nFactorial audience.
- Vercel Analytics, OG/Twitter preview, sitemap, robots, and localized error pages.

## Demo Video Status

A Remotion-produced demo video is embedded in the landing laptop mockup. The
`public/videos/` folder ships `blunderlab-demo-en.mp4` and
`blunderlab-demo-ru.mp4`; the landing picks the file matching the active
locale.

## Links

- Live URL: `https://blunderlab.vercel.app`
- GitHub: `https://github.com/sabr2007/blunderlab`
- Decisions: [`docs/decisions.md`](./decisions.md)
- PRD: [`docs/PRD.md`](./PRD.md)
- Demo script: [`docs/demo-script.md`](./demo-script.md)

## Roadmap

KZ locale, Remotion demo video, multiplayer-by-link, weekly report email, shareable review cards, fully generated pattern drills, real checkout, and school/team coach dashboard.
