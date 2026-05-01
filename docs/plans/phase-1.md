# BlunderLab — Phase 1 Plan

Дата: 2026-05-01
Статус: completed
Source of truth: [../decisions.md](../decisions.md)
Связанные документы: [../PRD.md](../PRD.md), [../design-document.md](../design-document.md), [../CJM.md](../CJM.md)

---

## 1. Purpose

Phase 1 фиксирует переход от продуктовой документации и базового scaffold к рабочему playable foundation.

Главная цель фазы:

> Собрать технический фундамент для Play → Game End → Review CTA, не уходя раньше времени в AI Review, Dashboard, Pro или polish.

Эта фаза не должна превращаться в попытку сразу сделать весь BlunderLab. По PRD и CJM главный продуктовый путь строится вокруг First Insight Moment, но перед ним нужна надёжная шахматная база: доска, правила, engine layer и схема данных.

---

## 2. Current Checklist

- [x] Reconcile `PRD.md` and `design-document.md` with `decisions.md`
- [x] Scaffold Next.js 16 + TypeScript + Tailwind + shadcn/ui
- [x] Add chess engine layer: `react-chessboard` + `chess.js` + Stockfish
- [x] Define Supabase schema (SQL migration file)

Результат:

> Phase 1 playable foundation is implemented on top of the existing scaffold.

Alignment check before closing Phase 1:

> Verified and reconciled: the scaffold now uses Next.js 16, Tailwind v4, TypeScript, shadcn-style local UI primitives, `react-chessboard`, `chess.js`, and Stockfish 18.

---

## 3. Phase 1 Scope

### In scope

- Interactive chessboard for Play Mode.
- Legal move validation through `chess.js`.
- Local game state: FEN, PGN, move history, turn, result.
- Stockfish Web Worker wrapper with `evaluate(fen)` and `bestMove(fen)`.
- Three AI difficulty presets from `decisions.md`: Beginner, Intermediate, Advanced.
- Basic Play screen structure: board, game status, move history, restart/resign controls.
- Game-end state with clear `Review my mistakes` CTA.
- Supabase SQL migration for the core MVP entities.
- Minimal persistence contract for profiles, games, moves, reviews, and daily review limits.

### Out of scope

- AI Coach OpenAI route.
- Full Game Review screen.
- Blunder taxonomy detector implementation.
- Dashboard, Daily Blunder, City Leaderboard.
- Auth UI polish beyond what is needed to support the schema plan.
- Real-time multiplayer.
- Payments or real Pro checkout.
- Demo video and final landing polish.

---

## 4. Implementation Order

1. **Chess board integration**
   - Add `react-chessboard` wrapper component.
   - Apply locked Graphite board palette from `decisions.md`.
   - Support selected square and last-move highlight.
   - Keep the Play screen mobile-first.

2. **Rules layer**
   - Add `chess.js` game state module.
   - Validate legal moves.
   - Track FEN, PGN, move history, turn, check, checkmate, stalemate, draw.
   - Expose a small API that UI can use without knowing chess.js internals.

3. **Stockfish layer**
   - Add Stockfish wasm assets under `public/stockfish/`.
   - Create `lib/chess/engine.ts`.
   - Implement promise-based `evaluate(fen)` and `bestMove(fen)`.
   - Add difficulty presets:
     - Beginner: skill 4, depth 6
     - Intermediate: skill 12, depth 10
     - Advanced: skill 18, depth 14

4. **Play vs AI loop**
   - User makes a legal move.
   - Engine responds with a difficulty-appropriate move.
   - UI updates board, move history, status, and game result.
   - Game end shows `Review my mistakes`.

5. **Supabase schema draft**
   - Add first SQL migration file in `supabase/migrations/`.
   - Define the minimum data model for:
     - user profile
     - games
     - game moves
     - review summaries
     - critical moments
     - daily review usage
     - future leaderboard snapshots
   - Enable RLS on user-owned tables.
   - Keep leaderboard and Daily Blunder fields ready for later phases, but do not implement their UI yet.

---

## 5. Supabase Schema Target

Phase 1 should produce a migration that supports later phases without overbuilding.

Required tables:

- `profiles`
- `games`
- `game_moves`
- `game_reviews`
- `critical_moments`
- `daily_review_usage`
- `leaderboard_snapshots`

Required enums or constrained fields:

- game status: active, checkmate, stalemate, draw, resigned, abandoned
- player color: white, black
- AI difficulty: beginner, intermediate, advanced
- blunder category: the 8 locked categories from `decisions.md`
- review severity: inaccuracy, mistake, blunder

RLS rule:

> Users can only read/write their own profile, games, moves, reviews, and usage rows. Public leaderboard data can be read by everyone later, but writes must stay server-only.

---

## 6. Acceptance Criteria

Phase 1 is done when:

- A user can open the Play screen and make legal chess moves.
- Illegal moves are rejected by the rules layer.
- The AI opponent can respond using Stockfish at one of three locked difficulty levels.
- The board is usable on mobile and desktop.
- The app can detect a finished game and show `Review my mistakes`.
- The engine wrapper has a stable API for Phase 2 review analysis.
- The Supabase migration defines the MVP data model with RLS.
- The implementation does not include Phase 2+ features except where needed as schema placeholders.

---

## 7. Planning Rule

Before writing implementation code beyond the current phase, we first write and approve the phase plan.

When planning and implementing later UI-heavy phases, use the available 21st.dev MCP / shadcn-style component sources as a practical accelerator for:

- landing sections;
- onboarding layout;
- dashboard blocks;
- pricing / Pro cards;
- sidebar and empty states.

21st.dev is an implementation accelerator, not a source of product truth. Product scope still comes from `PRD.md`, visual rules from `design-document.md`, and locked technical decisions from `decisions.md`.

Next planning documents:

1. Phase 2 — Review Core
2. Phase 3 — Service Layer
3. Phase 4 — Polish + Demo

Only after the phase plan is clear do we move to code.
