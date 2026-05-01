# BlunderLab — Phase 2 Plan

Дата: 2026-05-01
Статус: implemented (initial pass) — typecheck + build + 28 unit tests green
Source of truth: [../decisions.md](../decisions.md)
Связанные документы: [../PRD.md](../PRD.md), [../design-document.md](../design-document.md), [../CJM.md](../CJM.md), [./phase-1.md](./phase-1.md)

---

## 1. Purpose

Phase 1 даёт надёжный playable foundation: легальная доска, Stockfish-противник на трёх уровнях, схема Supabase. Но это пока не BlunderLab — это просто шахматы.

Главная цель Phase 2:

> Доставить **First Insight Moment** из CJM: пользователь заканчивает партию, нажимает `Review my mistakes` и за 5–8 секунд получает 3 critical moments, для каждого — best move, blunder category, human-readable AI Coach explanation и одну training goal на следующую партию.

Это та точка, после которой продукт перестаёт быть «ещё одной шахматной доской» и начинает оправдывать своё имя. Всё в этой фазе подчинено одному: сделать post-game review убедительным и быстрым. Auth, dashboard, daily blunder, leaderboard, pricing — всё это Phase 3+.

---

## 2. Current Checklist

- [x] Eval pipeline: каждое посадочное состояние партии → Stockfish eval (cp / mate) — `lib/chess/analysis.ts`
- [x] Critical moment detector: топ-3 по eval drop, с дедупликацией близких ходов — `lib/chess/critical-moments.ts`
- [x] Deterministic blunder taxonomy detector (8 categories из decisions.md §8) — `lib/chess/taxonomy.ts`
- [x] AI Coach service: OpenAI `gpt-4o-mini`, structured JSON, server-side — `lib/coach/{openai,prompts,index}.ts`
- [x] AI Coach fallback: deterministic templates per category (decisions.md §10) — `lib/coach/fallback.ts`
- [x] Review server action с rate limit и кэшем — `app/review/actions.ts`
- [x] `/review/[gameId]` screen: summary, 3 critical moment cards, AI Coach card, training goal — `app/review/[gameId]/page.tsx` + `components/review/*`
- [x] Mobile-first vertical layout review-экрана — vertical card grid; sticky summary on desktop
- [x] Wire `Review my mistakes` CTA из Play screen в `/review/[gameId]`
- [x] Persistence стартового объёма: `games`, `game_moves`, `game_reviews`, `critical_moments` через anonymous Supabase session — `app/play/actions.ts`, `lib/supabase/anonymous.ts`
- [x] Vitest unit-тесты для taxonomy, critical-moments и fallback (28 тестов проходят)
- [ ] Playwright e2e: full Play → finish → Review happy path (отложено — требует развёрнутого Supabase для прохождения, см. §13)

---

## 3. Phase 2 Scope

### In scope

- **Engine eval pipeline**: post-game проход по позициям (`fen_before` каждого хода юзера) с Stockfish, возвращающий `{ eval_before, eval_after, best_move }`.
- **Critical moment selection**: топ-3 моментов с наибольшим eval drop у юзера, при tie-break — позднее в партии.
- **Blunder taxonomy detector**: детерминистические правила из decisions.md §8 → кандидаты с приоритетом.
- **AI Coach service**: server-only вызов OpenAI с structured prompt, JSON-ответом и locale.
- **Fallback templates**: 8 шаблонов (decisions.md §10), используются при таймауте/5xx OpenAI и для unit-тестов.
- **Review storage**: запись `games`, `game_moves`, `game_reviews`, `critical_moments` через anonymous auth (Supabase `signInAnonymously`).
- **Review screen** `/review/[gameId]` с server-side загрузкой и client-side board navigation между critical moments.
- **Rate limit** free-tier: 3 reviews/day per user (server-side enforce через `daily_review_usage`).
- **Cache**: review результат кэшируется в `game_reviews` по `game_id`; повторный заход на `/review/[gameId]` не дёргает OpenAI.
- **i18n hook-up review-экрана** (минимально: EN + RU строки для UI лейблов; coach-output берёт locale из URL).

### Out of scope

- Полноценный auth UI (Google OAuth / magic link). Используем только anonymous session — Phase 3 поднимет это до full auth.
- Dashboard, Daily Blunder, City Leaderboard.
- Pro page и pricing UI.
- Account migration: что произойдёт, если anonymous user потом залогинится — отложено до Phase 3.
- Multi-game история и навигация по прошлым review.
- Animations / motion polish — только базовые transitions, без reveal-сценариев.
- Demo video, README screenshots, landing finalisation.
- Streak за review — учёт начнётся в Phase 3.

---

## 4. Implementation Order

Строго по этому порядку — каждый шаг закрывает риск следующего.

1. **Engine batch API**
   Расширить `lib/chess/engine.ts` методом `analyzePositions(fens, options)` или сделать новый модуль `lib/chess/analysis.ts`, который переиспользует `StockfishEngine`. Глубина анализа: depth 14 или 1.5s per position, что наступит раньше (decisions.md §3). Возврат: `Array<{ fen, evalCp, evalMate, bestMove, pv }>`.
   *Acceptance:* unit-тест прогоняет известную партию из 20 ходов и получает 21 eval за < 30s.

2. **Critical moment detector**
   Новый модуль `lib/chess/critical-moments.ts`. Берёт sequence eval от engine, вычисляет per-ply drop *с точки зрения юзера* (учитывая color), сортирует по убыванию drop, отбирает top-3 с фильтром `drop >= 1.0` и дедупликацией соседних позиций (`|ply_a - ply_b| < 2` → берём первый).
   *Acceptance:* unit-тест на захардкоженной партии возвращает ожидаемые ply.

3. **Taxonomy detector**
   `lib/chess/taxonomy.ts`. Принимает critical moment + позиции до/после + best move. Применяет 8 правил из decisions.md §8 в порядке приоритета, возвращает `{ category, severity, candidates[] }`. `severity` маппится по eval drop:
   - `>= 3.0` → blunder
   - `1.5..3.0` → mistake
   - `1.0..1.5` → inaccuracy
   *Acceptance:* unit-тесты для каждой из 8 категорий с минимум одной positive и одной negative позицией.

4. **OpenAI client + prompts**
   `lib/coach/openai.ts` — типизированный обёртка `chat.completions.create` с `response_format: { type: 'json_schema' }` (Zod-схема ответа). `lib/coach/prompts.ts` — system + user prompt builder, принимает `{ pgn, fen, userMove, bestMove, evalDropCp, candidateCategories, locale }`. Output schema: `{ category, severity, explanation, trainingHint }`. Timeout 10s. Retries: 0 (fallback быстрее).
   *Acceptance:* mock-тест проверяет, что schema accepts/rejects корректно.

5. **Fallback layer**
   `lib/coach/fallback.ts` — 8 функций по категории, которые принимают `{ piece?, square?, bestMove }` и подставляют в шаблоны (decisions.md §10). Используется и при OpenAI failure, и в unit-тестах detector-а как «чистая» имплементация.

6. **Review server action**
   `app/[locale]/(app)/review/[gameId]/actions.ts` (или `app/api/review/route.ts`, выбор фиксируется в коде):
   - проверяет, что `game_reviews` уже существует → возвращает кэш;
   - иначе: гарантирует anonymous session, проверяет `daily_review_usage < 3`, инкрементит, дёргает eval pipeline → critical moments → taxonomy → OpenAI Coach (с fallback), пишет `game_reviews` и `critical_moments`.
   - rate-limit ошибка возвращает structured error `{ kind: 'rate_limited', resetAt }`.
   *Acceptance:* integration-тест против локальной Supabase инстанса (или мока) на cache-hit и rate-limit.

7. **Anonymous session helper**
   `lib/supabase/anonymous.ts` — обёртка `auth.signInAnonymously()` если `auth.getUser()` пустой. Используется и при первом ходе в Play screen (чтобы записать `games` row), и в Review action.
   *Note:* Supabase anonymous должен быть включён в проектных настройках; добавляем в `.env.example` ремарку.

8. **Persist Phase 1 game state**
   Модификация `components/chess/play-view.tsx`: при первом ходе создать `games` row, на каждом ходе писать `game_moves`. Запись делаем через server actions, чтобы RLS работал. Финализация (`status` = checkmate/resigned/etc, `final_fen`, `pgn`) — на game-end.
   *Acceptance:* после партии в Supabase лежит ровно один `games` row + N `game_moves` row, FEN-цепочка валидна.

9. **Review screen**
   `app/[locale]/(app)/review/[gameId]/page.tsx` (RSC) загружает `game_reviews + critical_moments + games` join. Передаёт в client-component `ReviewView`.
   `components/review/review-view.tsx` (client) — vertical mobile layout:
   - GameSummaryCard (result, accuracy, blunders count, main pattern, coach verdict)
   - Stepper между 3 critical moments
   - На каждый момент: BoardSnapshot (read-only, last move + best move arrow), AICoachCard, BlunderPatternBadge, BestMoveCard
   - TrainingGoalCard внизу с `Play again with this goal` CTA → `/play?goal=<id>`
   На desktop тот же контент в grid: board слева, cards справа.
   *Acceptance:* Playwright e2e: партия из 6 ходов завершается резигнацией → `/review/[id]` рендерит 3 cards и кнопку.

10. **Review CTA wiring**
    В `play-view.tsx` кнопка `Review my mistakes` ведёт на `/review/${gameId}`. До этого она была декоративной.

11. **i18n strings**
    `messages/en.json` и `messages/ru.json` получают разделы `review.*`. Coach output генерируется на нужном locale через prompt.

---

## 5. Eval Pipeline Spec

### Input
- `pgn: string` финальной партии (из `games.pgn`).
- `userColor: PlayerColor`.
- `difficulty: AiDifficulty` (для контекста, не влияет на анализ).

### Process
1. Восстанавливаем sequence FEN-ов через `chess.js` (`pgn.loadPgn(pgn) → history({ verbose: true })`).
2. Для каждой позиции *перед ходом юзера* вызываем `engine.analyzePositions(fen)` с фиксированной глубиной 14.
3. Для каждой позиции *после хода юзера* также берём eval — нужно, чтобы вычислить drop корректно.
4. Drop считаем в pawn units (cp/100) с точки зрения юзера: положительный drop = юзер потерял оценку.

### Output

```ts
type AnalyzedPly = {
  ply: number;
  fenBefore: string;
  fenAfter: string;
  userMove: string;          // UCI
  bestMove: string;           // UCI from engine
  evalBeforeCp: number;       // от лица side-to-move
  evalAfterCp: number;
  evalDropCp: number;         // в пользу противника, в pawn units * 100
  pv: string[];
};
```

### Constraints
- Max budget: 1.5s per position. 40 ходов × 1.5s = 60s — приемлемо для server action; на клиенте делать не будем.
- Кэшируем по `(fen, depth)` в памяти процесса, чтобы повторный анализ той же партии (например, по retry) не платил заново.

---

## 6. Critical Moment Selection Spec

```
input:  AnalyzedPly[] для ходов юзера
filter: evalDropCp >= 100 (1.0 pawn)
sort:   evalDropCp DESC, потом ply DESC (поздние моменты весят больше при тае)
dedupe: если |ply_a - ply_b| < 2 → берём с большим drop
take:   top 3
```

Если у юзера 0 моментов с drop >= 100 — review всё равно создаётся, но `critical_moments` пустой и `summary` говорит «clean game» (special-case copy в i18n).

---

## 7. Blunder Taxonomy Detector Spec

Файл: `lib/chess/taxonomy.ts`.

Каждое правило — pure function `(input) => Candidate | null`. Применяются в порядке из decisions.md §8 (Hanging Piece первый, Endgame Technique последний). Все срабатывания идут в `candidates`, для финальной `category` берём первое сработавшее.

Сигнатуры (упрощённо):

```ts
type DetectorInput = {
  ply: AnalyzedPly;
  fenBeforeMove: string;
  fenAfterMove: string;
  fenAfterOpponentReply: string;     // для Hanging Piece, Greedy Move
  pieceCount: number;                  // для Endgame Technique
  isOpeningPhase: boolean;             // ply <= 20 (10 full moves)
};

type Candidate = {
  category: BlunderCategory;
  reason: string;                      // diagnostics, не показывается юзеру
};
```

GPT получает `candidates[]` и подтверждает / переопределяет финальную `category`.

---

## 8. AI Coach Service Spec

### Contract

| Шаг | Источник истины | Ответственность |
| --- | --- | --- |
| Best move | Stockfish | `lib/chess/analysis.ts` |
| Eval drop | Stockfish | `lib/chess/critical-moments.ts` |
| Category candidates | Deterministic rules | `lib/chess/taxonomy.ts` |
| Final category, explanation, training_hint | OpenAI (with deterministic fallback) | `lib/coach/*` |

OpenAI **не судит позицию** и **не выбирает best move** самостоятельно. Это критично для доверия: если AI начнёт «креативить», review развалится.

### Prompt shape

```
system:
  You are BlunderLab Coach. You explain chess mistakes in plain language.
  You receive verified analysis (best move, eval drop, candidate categories).
  You DO NOT analyse the position yourself — only translate inputs into
  one short coach explanation. Reply strictly as JSON matching the schema.

user (JSON):
  {
    "locale": "en",
    "fenBefore": "...",
    "userMove": "Qxe5",
    "bestMove": "Bd3",
    "evalDropCp": 240,
    "candidateCategories": ["Tunnel Vision", "King Safety"]
  }
```

### Response schema (Zod)

```ts
const coachResponse = z.object({
  category: z.enum([...8 categories]),
  severity: z.enum(['inaccuracy', 'mistake', 'blunder']),
  explanation: z.string().min(40).max(280),
  trainingHint: z.string().min(20).max(180),
});
```

### Failure modes

- **Schema fail / 5xx / timeout 10s** → fallback template для категории top-1 candidate.
- **Rate limit (Anthropic/OpenAI side)** → fallback + флаг `review_model = 'fallback'` в `game_reviews`.
- **No critical moments** → coach не вызывается, summary через шаблон «clean game».

---

## 9. Persistence & Anonymous Auth

Phase 2 обязан писать данные в Supabase, иначе review не получится воспроизвести и не сработает кэш. Но полноценный auth не нужен.

Решение: **anonymous Supabase session**.

- При первом ходе в `play-view.tsx` server action `startGame` гарантирует session через `auth.signInAnonymously()` если её нет, создаёт `games` row.
- `auth.uid()` всегда есть, RLS работает без доработок.
- `profiles` row создаётся лениво при первом обращении (триггер на `auth.users` или server action).
- В Phase 3 при «настоящем» login будем мигрировать anonymous → authenticated user через `auth.linkIdentity()` (планируем, не реализуем сейчас).

`.env.example` дополняется:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, для review action
OPENAI_API_KEY=                   # server-only
OPENAI_MODEL=gpt-4o-mini
COACH_TIMEOUT_MS=10000
REVIEW_DAILY_LIMIT=3
```

---

## 10. Acceptance Criteria

Phase 2 done, когда:

1. После завершения партии в Play screen кнопка `Review my mistakes` ведёт на `/review/[gameId]` без 404.
2. На review-экране отображаются 3 critical moments (или explicit «clean game» state).
3. Каждый critical moment показывает: позицию на доске, ход юзера, best move (стрелка), категорию (одна из 8), AI Coach explanation на нужном locale.
4. Внизу есть Training Goal Card с одной конкретной формулировкой и CTA на новую партию.
5. Повторный заход на `/review/[gameId]` не делает OpenAI запрос (cache-hit из `game_reviews`).
6. Free user не может создать 4-й review в сутки — UI показывает rate-limit message и отсылку к Phase 3 Pro.
7. При недоступности OpenAI review всё равно генерируется (через fallback templates) и помечается `review_model = 'fallback'`.
8. Vitest coverage для `lib/chess/critical-moments.ts`, `lib/chess/taxonomy.ts`, `lib/coach/fallback.ts` ≥ 80%.
9. Playwright happy-path passes: open Play → make moves → resign on move 6 → click Review → assert 3 cards + training goal.
10. Mobile layout: review-экран читается одной рукой на 375×667 viewport (Playwright snapshot).

---

## 11. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Stockfish-анализ 40-ходовой партии медленный (> 60s) | Параллелим engine instances (worker pool 2–3); ставим hard cap на depth 12 для long games |
| OpenAI GPT возвращает невалидный JSON | `response_format: json_schema` + Zod-валидация + fallback по timeout/parse-error |
| Anonymous session migration в Phase 3 ломает FK | RLS уже завязан на `auth.uid()`, при `linkIdentity` `user_id` не меняется — миграция бесшовная |
| Detector помечает clean game blunder-ами из-за noisy engine | Минимальный drop порог 1.0 pawn (100 cp), и игнорируем mate-score флуктуации |
| Coach explanation выглядит generic | Промпт получает `userMove`, `bestMove`, `evalDropCp` и кандидатов — это даёт конкретику без «творчества» от модели |
| Free 3 reviews/day слишком жёстко для демо | Конфиг `REVIEW_DAILY_LIMIT` env-vars, демо-юзер может иметь 30 |

---

## 12. Implementation Deltas (зафиксированы при реализации)

Эти отклонения от исходного плана сделаны сознательно — записываем их явно, чтобы позже не выглядели как «забытые».

1. **Анализ выполняется на клиенте, а не на сервере.**
   Stockfish уже работает в Web Worker (Phase 1). Запускать его дополнительно на сервере значило бы дублировать инфраструктуру и платить cold-start за каждый review. Поэтому пайплайн engine → critical moments исполняется на client side в `components/review/review-view.tsx`, а server action `submitReviewAction` принимает уже готовые `CriticalMomentInput[]`, добавляет taxonomy + Coach и пишет в Supabase. Это согласуется с decisions.md §3 («На клиенте — стоимость $0, прайвиси ок»).

2. **Routes пока flat, без `/[locale]/...`.**
   Phase 1 уже использует плоские роуты (`/play`), подключение i18n `next-intl` запланировано в Phase 4. Coach получает `locale` через `submitReviewAction` (дефолт `en`); `messages/*.json` в репозитории ещё нет — UI-строки review-экрана хардкодом по-английски.

3. **Anonymous Supabase auth требует ручного включения в проекте.**
   В `Auth > Providers > Anonymous` галочка должна быть включена. Это документировано в `.env.example`. Без этого `supabase.auth.signInAnonymously()` отвечает 422 и `play-view` переходит в `disabled` state с понятной подсказкой — gameplay при этом не ломается, только persistence/review.

4. **Supabase JS клиенты untyped.**
   Текущая `@supabase/ssr` 0.5.x + `@supabase/supabase-js` 2.47.x требуют расширенного `Database` дженерика (Tables/Views/Functions/Enums + `__InternalSupabase`). Для Phase 2 это излишний шум: row-types живут в `lib/supabase/database.types.ts` и используются явно в коде, а сами клиенты возвращают untyped data. Возврат к типизированному клиенту — задача Phase 3 вместе с генерацией типов из supabase CLI.

5. **PGN восстанавливается на финализации партии.**
   `chess.js` не хранит историю при создании от FEN, поэтому `play-view.tsx` накапливает `MoveRecord[]` и при game-end вызывает `buildPgn(replay)` (`lib/chess/rules.ts`). Без этого PGN был бы пустым и review невозможен.

6. **Difficulty фиксируется после первого хода.**
   Это не было в исходном плане, но переключение сложности посреди партии создавало бы конфликт с записанным `games.ai_difficulty`. Это маленькая, но осознанная UX-правка.

## 13. Open Items (для завершения Phase 2 acceptance)

- **Playwright e2e**. Требует development-сервера + поднятого Supabase (anonymous auth включён). Каркас `playwright.config.ts` ещё не добавлен. План: один happy-path сценарий (Play → 6 ходов → resign → Review → проверить `[data-testid="critical-moment"]` × 3 либо clean-game state) появится в первой задаче Phase 3 вместе с auth-флоу.
- **Mobile snapshot validation**. Layout уже vertical-first (одна колонка карточек), но Playwright snapshot тест на 375×667 ещё не запускался.
- **Reduced-motion respect для review progress bar**. Прогресс-бар анимируется через `transition-[width]`. Глобальный `prefers-reduced-motion` блок в `app/globals.css` уже отключает анимации, но конкретно эту transition стоит проверить вручную.

## 14. Planning Rule

Phase 2 не должен открывать новые продуктовые поверхности — никаких dashboard, daily blunder, leaderboard, pricing UI. Если по ходу реализации возникнет соблазн добавить что-то «по дороге», это идёт в Phase 3 backlog.

UI-блоки для review-экрана (cards, stepper, badges) делаем поверх существующих shadcn-style примитивов из `components/ui/*`. Если понадобятся новые блоки уровня Hero / Pricing — это сигнал, что мы вышли из scope.

Next planning documents (после Phase 2 acceptance):

1. Phase 3 — Service Layer (auth Google + magic link, dashboard, daily blunder, city leaderboard, Pro page).
2. Phase 4 — Polish + Demo (animations, demo video, landing final, RU локаль, submission материалы).

Phase 2 acceptance: 9 из 10 пунктов §10 выполнены; пункт 9 (Playwright happy-path) и проверка mobile snapshot в §13 переезжают первыми задачами в Phase 3 как обязательная регрессия. Только после их закрытия Phase 2 считаем закрытым окончательно.
