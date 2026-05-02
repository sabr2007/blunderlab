# BlunderLab — Locked Decisions v1.1

Дата фиксации: 2026-05-01
Статус: Source of truth. При расхождении с PRD/Design Doc — побеждает этот файл.
Принцип выбора: путь наименьшего сопротивления (working defaults > optimal but slow).

Если что-то меняется — правим здесь, потом синхронизируем в PRD и design-document.md.

---

## 1. Tech Stack

| Слой | Решение | Почему |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Vercel-native, server actions, RSC, наименьшая инфраструктура |
| Language | TypeScript strict | Стандарт для команды, ловит ошибки рано |
| Styling | Tailwind CSS v4 | Тоже Vercel-native, OKLCH-friendly, быстрее CSS-in-JS |
| UI primitives | shadcn/ui (на Radix) | Локальные копии, легко кастомизировать, не lock-in |
| Icons | Lucide React | Согласовано с shadcn |
| Fonts | Geist Sans + Geist Mono | Zero-config через `next/font/local` или `geist` пакет |
| Animation | Framer Motion | Точечно — hero reveal, board highlight, AI Coach typing |
| Charts | Recharts | Только для Dashboard |
| Forms | React Hook Form + Zod | Валидация на клиенте и сервере одной схемой |
| i18n | next-intl | RSC-совместим, статический и динамический контент |
| Tooling | Biome (lint + format) | Один инструмент вместо ESLint+Prettier |
| Testing | Vitest (unit) + Playwright (e2e) | Vitest быстрее Jest, Playwright стандарт |
| Pre-commit | lefthook | Лёгче husky, конфиг в одном yaml |
| Pkg manager | pnpm | Быстрее, экономит диск, monorepo-ready |
| Deploy | Vercel | Next.js, превью на каждую ветку, Edge runtime для AI proxy |

---

## 2. Backend / Data

| Решение | Детали |
| --- | --- |
| База + auth | Supabase (Postgres + Auth + Storage + RLS) |
| Auth providers | Google OAuth + email magic link |
| Server access | Supabase JS client + типизированные server actions |
| Миграции | SQL файлы в `supabase/migrations/` |
| RLS | Включён на все таблицы с user-data |
| Storage | Supabase Storage для shareable review cards (later) |

---

## 3. Chess Engine

| Решение | Детали |
| --- | --- |
| UI | `react-chessboard` v4 |
| Rules | `chess.js` v1 |
| Engine | `stockfish.wasm` в Web Worker |
| Depth | 14 (или time-limit 1.5s, что наступит раньше) |
| Где работает | На клиенте — стоимость $0, прайвиси ок |
| Engine API | Тонкая обёртка `lib/chess/engine.ts` с promise-based `evaluate(fen)` и `bestMove(fen)` |
| AI противник | Тот же Stockfish, но с пониженным skill level (0–20) под уровень пользователя |

**Уровни сложности (skill_level → MultiPV / depth):**
- Beginner — skill 4, depth 6
- Intermediate — skill 12, depth 10
- Advanced — skill 18, depth 14

---

## 4. AI Coach

| Решение | Детали |
| --- | --- |
| Модель | OpenAI `gpt-4o-mini` |
| Где вызываем | Server action / Edge route, не из клиента |
| Контракт | Stockfish — источник истины (best move, eval), GPT — только формулирует объяснение и категорию |
| Промпт | Structured: получает позицию, ход юзера, лучший ход, eval drop, кандидаты на категорию |
| Output | JSON: `{ category, severity, explanation, training_hint }` |
| Кэш | Хэш `(fen + user_move + best_move)` → review JSON в Supabase, TTL ∞ |
| Rate limit | Free 3 reviews/day per user (server-side enforced) |
| Fallback | Если OpenAI > 10s timeout или 5xx → детерминистический template per category (см. §10) |
| Cost | ~$0.0002/review × 90k reviews/мес = ~$18/мес при 1000 active users × 3 reviews |

---

## 5. Visual System

### Board palette (locked: Graphite)
```
--board-light: oklch(78% 0.01 240);
--board-dark:  oklch(35% 0.02 240);
--board-last-move: oklch(75% 0.18 70 / 0.35);   /* amber overlay */
--board-best-move: oklch(70% 0.18 145 / 0.45);  /* emerald overlay */
--board-blunder:   oklch(60% 0.22 25 / 0.45);   /* coral overlay */
```

### Pieces
- **Cburnett SVG set** (классический шахматный wikipedia-стандарт, ships с `react-chessboard`).
- Не делаем кастомный набор для MVP/submission.
- Pro-value для submission строится вокруг training modes и deeper review, а не вокруг piece skins.

### Theme
- **Default: dark.** Это редкий случай, где dark уместен — лабораторная эстетика, чтение review вечером.
- Light toggle **не входит** в submission-scope. Dark остаётся единственной поддерживаемой темой до подачи.

### Typography
- UI: **Geist Sans**, weights 400/500/600/700.
- Mono: **Geist Mono** для FEN, PGN, debug.
- Type scale (через CSS clamp):
  - `--text-xs` 0.75rem
  - `--text-sm` 0.875rem
  - `--text-base` 1rem
  - `--text-lg` clamp(1.125rem, 1rem + 0.4vw, 1.25rem)
  - `--text-xl` clamp(1.5rem, 1.2rem + 1vw, 2rem)
  - `--text-display` clamp(2.5rem, 1.5rem + 4vw, 4.5rem)

### Color tokens (semantic)
```
--color-bg:        oklch(14% 0.01 250);   /* near black */
--color-surface:   oklch(20% 0.01 250);   /* card */
--color-surface-2: oklch(25% 0.01 250);   /* elevated */
--color-border:    oklch(30% 0.01 250);
--color-text:      oklch(95% 0 0);
--color-text-muted:oklch(70% 0.01 250);
--color-accent:    oklch(68% 0.18 250);   /* cobalt */
--color-success:   oklch(70% 0.18 145);   /* emerald */
--color-warning:   oklch(78% 0.16 70);    /* amber */
--color-danger:    oklch(65% 0.22 25);    /* coral */
```

### Motion
- Default duration: 200ms (`--duration-normal`).
- Fast: 120ms. Slow: 400ms.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo).
- Reduced motion: respect `prefers-reduced-motion`.

---

## 6. Internationalization

| Решение | Детали |
| --- | --- |
| Lib | `next-intl` |
| Locales at MVP | **EN, RU** |
| Locale at submission demo | RU (под казахстанскую аудиторию nFactorial) |
| KZ | Roadmap, не блокер |
| Default | `en` |
| URL strategy | `/[locale]/...` |
| Coach output | Промпт получает `locale`, GPT отвечает на нужном языке |

---

## 7. Leaderboard

**Имя рейтинга:** _Top Improvers in {city}, last 7 days_

**Формула:**
```
score = avg_blunders_per_game(last_7_days) - avg_blunders_per_game(prior_7_days)
```
- Чем более негативный score — тем выше место (улучшение = меньше блёндеров).
- Tie-break: больше reviewed games за 7 дней.

**Eligibility:**
- Минимум **5 reviewed games** за last 7 days.
- City поле обязательно (Almaty / Astana / Shymkent / Other).

**Refresh:** snapshot записывается раз в сутки cron-функцией Supabase (или Vercel Cron). UI читает последний snapshot.

---

## 8. Blunder Taxonomy (LOCKED — ровно 8)

| # | Category | One-liner для UI |
| --- | --- | --- |
| 1 | Hanging Piece | You left a piece undefended. |
| 2 | Missed Tactic | A tactical shot was on the board — and you missed it. |
| 3 | King Safety | You weakened your king or ignored a mating threat. |
| 4 | Tunnel Vision | You focused on your plan and missed the opponent's reply. |
| 5 | Greedy Move | You grabbed material and got a worse position. |
| 6 | Time Panic | The move looks like it was made too fast. |
| 7 | Opening Drift | Early deviation from sound development. |
| 8 | Endgame Technique | A more precise endgame method existed. |

**Detection rules (детерминистические, до AI):**
- Hanging Piece: после хода юзера в течение 1 ply фигура захватывается без recapture или с потерей материала.
- Missed Tactic: best move дает eval drop ≥ 2.0 в пользу юзера vs played move.
- King Safety: best move связан с защитой / атакой короля; played move ослабляет king safety (heuristic: open files near king, lost pawn shield).
- Tunnel Vision: played move продолжает атаку юзера, но best move — defensive move с большим eval gap.
- Greedy Move: played move захватывает материал, eval drop ≥ 1.5 после ответа.
- Time Panic: ход сделан < 3 секунд при наличии серьёзной угрозы. (используем only если есть таймер).
- Opening Drift: первые 10 ходов, eval drop ≥ 1.0, played move не в opening book.
- Endgame Technique: < 12 фигур на доске, eval drop ≥ 1.0.

Несколько правил могут срабатывать — выбираем категорию с наибольшим приоритетом по списку выше.
GPT получает кандидатов и подтверждает / уточняет финальную категорию.

### Fallback templates (когда OpenAI недоступен)
- **Hanging Piece** — "Your {piece} on {square} was left undefended. Always check your moved piece is protected after you release it."
- **Missed Tactic** — "There was a tactical shot here: {best_move}. Look for forcing moves — checks, captures, threats — before deciding."
- **King Safety** — "This move weakened your king. {best_move} would have kept your king safe."
- **Tunnel Vision** — "You continued your attack, but the position needed defense. {best_move} addressed the threat first."
- **Greedy Move** — "Grabbing material here cost you the position. {best_move} kept the balance."
- **Time Panic** — "This looks like a quick decision. Slowing down would have revealed {best_move}."
- **Opening Drift** — "Early move out of the book. {best_move} keeps standard development."
- **Endgame Technique** — "There's a more precise method: {best_move}."

---

## 9. Project Structure

```
blunderlab/
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/
│   │   │   └── page.tsx              # landing
│   │   ├── (app)/
│   │   │   ├── play/
│   │   │   ├── review/[gameId]/
│   │   │   ├── dashboard/
│   │   │   ├── daily-blunder/
│   │   │   ├── leaderboard/
│   │   │   ├── pro/
│   │   │   └── settings/
│   │   ├── (auth)/
│   │   │   └── sign-in/
│   │   └── layout.tsx
│   ├── api/
│   │   └── coach/route.ts            # AI Coach edge route
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn primitives
│   ├── chess/                        # ChessBoardWrapper, MoveHistory, GameStatus
│   ├── review/                       # CriticalMomentCard, AICoachCard, BlunderPatternBadge, TrainingGoalCard
│   ├── dashboard/
│   └── landing/
├── lib/
│   ├── chess/                        # engine wrapper, eval pipeline, taxonomy detector
│   ├── coach/                        # OpenAI client, prompts, fallback templates
│   ├── supabase/                     # browser + server clients, types
│   └── utils.ts
├── hooks/
├── messages/
│   ├── en.json
│   └── ru.json
├── supabase/
│   └── migrations/
├── public/
│   └── stockfish/                    # stockfish.wasm assets
├── e2e/
└── styles/
    └── tokens.css
```

---

## 10. Phases & Deliverables

Детальный активный план первой фазы: [plans/phase-1.md](./plans/phase-1.md).

### Phase 0 — scaffold (Day 1, _в текущей сессии_)
- Next.js + Tailwind + shadcn + i18n + Supabase clients.
- Базовый dark layout, landing placeholder.
- README со ссылкой на этот файл.

### Phase 1 — playable
- Play vs Stockfish (3 уровня).
- Game persisted в Supabase.
- Review CTA после партии.

### Phase 2 — review core
- Eval pipeline (Stockfish → critical moments).
- Blunder taxonomy detector.
- AI Coach (OpenAI + fallback).
- Game Review screen с 3 critical moments.

### Phase 3 — service layer
- Auth (Google + magic link).
- Dashboard (top weakness, streak, recent games).
- Daily Blunder.
- City Leaderboard.
- Pro page.

### Phase 4 — polish + demo
- i18n RU.
- Animations.
- Demo video (Remotion / HyperFrame).
- Landing final.
- Submission материалы.

### Final submission sprint — locked 2026-05-02
- См. [plans/submission-final-scope.md](./plans/submission-final-scope.md).
- Must-do: Training Goal continuity on Play, Weekly Weakness + Identity Label, training modes surface, Chess for Builders landing, Pro page copy sync.
- Pro-value: unlockable training modes, unlimited/deeper review, pattern drills, weekly personalized plan. Не cosmetic skins.
- Out of scope for submission: light theme, custom board palettes, custom piece skins, PostHog funnel, Sentry, legal expansion, PWA, public profiles, shareable OG cards, real Stripe.

---

## 11. Out of scope (не сейчас)

- Real-time multiplayer / WebSockets.
- Реальные платежи (Stripe). Pro page — UI без покупки.
- Турниры, рейтинг ELO.
- Mobile apps.
- KZ локаль.
- Light theme toggle for submission.
- Custom board palettes / custom piece skins as Pro-value for submission.
- Social network features (friends, chat).

---

## 12. Closed / deferred questions

- AI Coach voice — **closed in Phase 4**: имя `BlunderLab Coach`, UI avatar `BrainCircuit`, tone `precise, supportive, never humiliating`; спокойный шахматный наставник без filler-фраз.
- Аналитика — **closed in Phase 4**: Vercel Analytics как минимальный submission-ready вариант. PostHog event tracking остаётся roadmap.
- Pro pricing local currency — deferred until payments become real. Current submission pricing stays USD prototype copy.
- Demo video — Remotion remains the chosen production path, but the landing currently keeps an empty reserved slot; actual video production is deferred by explicit execution decision.
- Final sprint scope — **closed 2026-05-02**: implement the committee-visible loop from `Play -> Review -> Training Goal -> Play again`, add Weekly Weakness + Identity Label, add training modes as Pro-value, and add Chess for Builders. Light theme and cosmetic skins are explicitly deferred.
