# BlunderLab — 2-3 Minute Demo Script

## 0:00-0:20 — Landing

Open `/en` or `/ru`.

Say: “BlunderLab is not trying to clone a chess platform. It focuses on the moment after a game, where beginners know they made a blunder but do not know what to train next.”

Show: hero with the Start training CTA, the Play → Review → Pattern → Train flow, and the embedded laptop demo video (locale-matched MP4).

## 0:20-0:55 — Play

Open `/en/play` directly — guests are admitted without a sign-in detour and an anonymous Supabase session is created on the fly.

Say: “The player starts with a simple browser game against Stockfish. Legal moves are validated locally through chess.js, and the game is persisted for review.”

Show: pick Classic, make a few moves or resign for a quick review path.

## 0:55-1:35 — Review

Open a seeded `/en/review/[gameId]`.

Say: “The review screen finds the critical moments, highlights the move played, the best move, and the blunder pattern. BlunderLab Coach explains the mistake in plain language and gives a training hint.”

Show: critical moment card, pattern badge, best move, and BlunderLab Coach card.

## 1:35-2:05 — Retention Loop

Open `/en/dashboard` and `/en/daily-blunder`.

Say: “The dashboard turns reviews into progress: top weakness, streak, recent reviews, Daily Blunder, and city rank. Daily Blunder converts old mistakes into personal puzzles — it is gated behind sign-in so the data belongs to a real account.”

## 2:05-2:30 — Submission Close

Open `/en/pro`.

Say: “Free proves the learning loop. Pro and School show the monetization path without implementing payments yet. The next production step is the Remotion demo video and public smoke test.”

Close with: “BlunderLab turns engine analysis into a repeatable training habit.”

## Notes for Live Demo

- Use an incognito window to verify the guest path: `/en/play` should land
  directly on the mode picker with no sign-in screen in between.
- Run a 5-move game and resign; the resulting Review may be a clean game
  (no banner) or contain critical moments — both are acceptable.
- For the retention loop, sign in with a seeded account so Daily Blunder
  shows a real position; with a guest you will see the sign-in card.
