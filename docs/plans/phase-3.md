# BlunderLab — Phase 3 Plan

Дата: 2026-05-01
Статус: implemented (initial pass) — typecheck, lint, build, unit tests and Playwright smoke green
Source of truth: [../decisions.md](../decisions.md)
Связанные документы: [../PRD.md](../PRD.md), [../design-document.md](../design-document.md), [../CJM.md](../CJM.md), [../deployment.md](../deployment.md), [./phase-1.md](./phase-1.md), [./phase-2.md](./phase-2.md)

---

## 1. Purpose

Phase 1 дала рабочую партию против Stockfish, Phase 2 — главный wow-момент (Game Review с AI Coach и blunder pattern). Этого достаточно, чтобы продукт «удивил» один раз. Но это всё ещё прототип одной фичи — нет причин возвращаться завтра, нет ощущения сервиса.

Главная цель Phase 3:

> Превратить BlunderLab из «sandbox для одного review» в **сервис, в который хочется вернуться** — с настоящим логином, dashboard прогресса, ежедневной задачей из своих ошибок, городским рейтингом и видимой бизнес-моделью.

Это не про новую визуальную упаковку. Это про retention loop из CJM §9: `Play → Review → Pattern → Goal → Dashboard → Daily Blunder → Return`. Каждая Phase 3 фича закрывает один шаг этого цикла.

Дополнительный технический стимул: Phase 2 ехала на anonymous Supabase session и untyped JS-клиентах. Phase 3 — окно, чтобы привести их в production-форму без больших переделок: подключить настоящий auth с миграцией данных и сгенерировать типизированные клиенты.

---

## 2. Current Checklist

- [x] Type-safe Supabase client (`lib/supabase/database.generated.ts` + typed browser/server/service-role clients)
- [x] Auth UI: `/sign-in` page с Google + email magic link
- [x] Auth callback route `app/auth/callback/route.ts`
- [x] Anonymous → real-account миграция через `linkIdentity` / `updateUser({email})` без потери Phase 2 партий
- [x] Onboarding flow: skill level + city → `profiles` row → `/dashboard`
- [x] Proxy-protect для `/dashboard`, `/daily-blunder`, `/leaderboard`, `/settings`
- [x] Dashboard `/dashboard` — top weakness, streak, recent reviews, pattern trend chart
- [x] Daily Blunder `/daily-blunder` — позиция из прошлой ошибки + проверка ответа + streak credit
- [x] City Leaderboard `/leaderboard` — top improvers, по городам, читает свежий snapshot
- [x] Cron job (Vercel Cron) для `leaderboard_snapshots` — раз в сутки UTC midnight
- [x] Pro page `/pro` — три tier-карточки + comparison + waitlist email-capture (без Stripe)
- [x] Profile / Settings `/settings` — city, default difficulty, display name, sign-out, delete account
- [x] Carry-over from Phase 2: Playwright smoke gates for public surfaces + auth guard
- [ ] Carry-over from Phase 2: full Playwright Play → Review happy path against configured Supabase
- [ ] Carry-over: persisted mobile screenshot snapshot для review/dashboard после тестового auth seed

Implementation note:

> The code path is implemented and verified locally, but the new SQL migration must still be applied to the managed Supabase project before deployed Phase 3 routes that use `daily_blunder_attempts` or `waitlist_signups` can persist data.

---

## 3. Phase 3 Scope

### In scope

- **Auth-UI с Google OAuth + email magic link** (decisions.md §2). Анонимная сессия Phase 2 апгрейдится без потери данных через `auth.linkIdentity()` для OAuth и `auth.updateUser({email})` для email. Новые пользователи получают сразу настоящий аккаунт.
- **Onboarding**: после первого реального sign-in — выбор уровня (Beginner/Intermediate/Advanced) и города (Almaty/Astana/Shymkent/Other), создание `profiles` row.
- **Dashboard** (`/dashboard`) — главная страница залогиненного пользователя. Карточки: Games reviewed (всего), Current streak, Top weakness (mode из `main_category` за последние 7 дней), Recent reviews (3 последних с навигацией в `/review/[gameId]`), Pattern trend (Recharts area-chart по неделям). Daily Blunder preview-карточка, City rank mini-widget.
- **Daily Blunder** (`/daily-blunder`) — одна позиция в день из прошлых `critical_moments` пользователя. Board показывает `fen_before`, скрытый best_move, prompt «find the move you missed». Submit правильного хода → success state + streak credit. Reveal без попытки → coach explanation, без streak.
- **City Leaderboard** (`/leaderboard`) — top improvers за last 7 days по формуле из decisions.md §7. Читает последний snapshot, которые пишет cron job. Фильтр по городу.
- **Cron job** — Vercel Cron route `/api/cron/leaderboard-snapshot` дёргает service-role-клиент, считает score per city, делает upsert в `leaderboard_snapshots`. Запускается раз в сутки в 00:05 UTC. Idempotent через unique-constraint `(city, period_start, period_end)`.
- **Pro page** (`/pro`) — три pricing-tier карточки (Free / Pro / School), comparison table, single CTA «Join Pro waitlist» → email-capture в новую таблицу `waitlist_signups`. Без Stripe — это демонстрация бизнес-логики, не реальная монетизация.
- **Profile / Settings** (`/settings`) — изменение `display_name`, `city`, `default_difficulty`. Sign-out. Soft-delete account.
- **Authed app shell** — `app/(app)/layout.tsx` с боковой навигацией (Play, Dashboard, Daily, Leaderboard, Settings) и user menu. Middleware-protect: попытка зайти на `/dashboard` без сессии → redirect на `/sign-in?next=/dashboard`.
- **Typed Supabase client** — генерация типов через CLI, замена `SupabaseClient` без дженерика на `SupabaseClient<Database>`. Снимает delta #4 из Phase 2.
- **Carry-over тесты Phase 2**: Playwright e2e happy-path, mobile snapshot 375×667, reduced-motion верификация для review progress-bar.

### Out of scope

- Реальные платежи (Stripe / Paddle). Pro waitlist собирает только email; ничего не списывается.
- B2B coach dashboard для школ (только UI-карточка School-tier, без функциональности).
- Tournaments, ELO-rating, сезонные ивенты.
- Training modes are the preferred future Pro-value. Custom board skins / piece skins are cosmetic roadmap only, not the main Pro promise.
- Push notifications, web push, email-нотификации (рассылки про Daily Blunder).
- Real-time multiplayer, friends, social features.
- KZ локаль (Phase 4 вместе с RU полировкой).
- Demo video, README screenshots, landing final polish (Phase 4).
- `[locale]` URL-prefix routing — продолжает быть отложенным.
- Account merge: если у пользователя на разных устройствах две anon-сессии и он залогинится из обеих, данные второй сессии остаются у одного user_id, первой — у другого. Корректный merge — отдельная фича на потом.

---

## 4. Implementation Order

Порядок выбран так, чтобы каждый шаг закрывал риск следующего. Ничего не блокирует Phase 2 функциональность — `/play` и `/review/[gameId]` продолжают работать с анонимной сессией всё время.

1. **Type-safe Supabase client.**
   `pnpm dlx supabase gen types typescript --project-id tsijruonmfrwydtdmpdx --schema public > lib/supabase/database.generated.ts`. Заменяем `SupabaseClient` на `SupabaseClient<Database>` в `lib/supabase/{browser,server}.ts`. Существующие server actions и review pipeline продолжают работать — это compile-time refactor.
   *Acceptance:* `pnpm typecheck` зелёный, никаких `any`-падений.

2. **Auth pages + callback.**
   - `app/sign-in/page.tsx` — две кнопки (Google, Email), email-форма с zod-валидацией, состояния `idle/sending/sent/error`.
   - `app/auth/callback/route.ts` — handler для OAuth callback и email confirm. Принимает `code`, делает `supabase.auth.exchangeCodeForSession(code)`, redirect на `?next=` или `/dashboard`.
   - Helper `lib/auth/upgrade.ts`: `upgradeAnonymousIdentity(provider)` — детектит активную anon-сессию и вызывает `linkIdentity` вместо `signInWithOAuth`, для email — `updateUser({email})` вместо `signInWithOtp`. Без anon-сессии падает в обычные методы. Глубокая спека в §5.
   *Acceptance:* новый юзер регистрируется через Google за один клик; существующий anon-юзер апгрейдится без потери `games`/`game_reviews`.

3. **Auth middleware + redirect-protected routes.**
   `middleware.ts` в корне (или edge runtime) проверяет `getUser()` для путей `/dashboard`, `/daily-blunder`, `/leaderboard`, `/settings`. Если нет authed-сессии (анонимная **не** считается) — redirect на `/sign-in?next=<original>`. `/play` и `/review/[gameId]` остаются доступны анонимам (Phase 2 behaviour preserved).
   *Acceptance:* curl `/dashboard` без cookie возвращает 307 на `/sign-in`.

4. **Onboarding `/onboarding`.**
   Server action: после `exchangeCodeForSession`, если `profiles` row отсутствует или `display_name is null` — middleware/callback redirect на `/onboarding` вместо `/dashboard`. Форма из 2 шагов: skill level + city. Submit → upsert `profiles` → `/dashboard`.
   *Acceptance:* первый login на чистый user_id ведёт на onboarding, второй — мимо него.

5. **Authed shell.**
   `app/(app)/layout.tsx` оборачивает `/dashboard`, `/daily-blunder`, `/leaderboard`, `/settings` в один shell: sidebar с navigation, user menu (avatar, sign-out), top-bar с city badge. Reuse `components/ui/*` примитивы. Mobile — sidebar схлопывается в bottom nav.
   *Acceptance:* sidebar показывает active state на текущем route, sign-out через user menu редиректит на landing.

6. **Profile / Settings `/settings`.**
   Простая форма: display_name (text), city (select из 4 значений), default_difficulty (select из 3). React Hook Form + Zod. Server action `updateProfileAction` обновляет `profiles`. Footer: «Sign out» + «Delete account» (soft-delete: помечает `profiles.deleted_at`, не трогает auth.users — Supabase admin удалит позже).
   *Acceptance:* изменение `city` отражается в leaderboard-фильтре после сохранения.

7. **Dashboard `/dashboard`.**
   Server-side data load: 4 запроса параллельно через `Promise.all` (recent reviews, weekly counts, top weakness aggregation, streak). Карточки:
   - **Games reviewed**: count `game_reviews` за last 30 days.
   - **Current streak**: непрерывная цепочка дней с ≥ 1 событием (review || daily blunder solve). Считается ленивым SQL-запросом (см. §7).
   - **Top weakness**: mode `main_category` из `game_reviews` за 7 дней; если null — empty state.
   - **Pattern trend**: Recharts area chart, неделя × количество blunders по категориям (top-3).
   - **Recent reviews**: 3 последних `game_reviews` с link на `/review/[gameId]`.
   - **Daily Blunder preview**: today's status (not started / in progress / completed).
   - **City rank**: место юзера в свежайшем snapshot для его города.
   *Acceptance:* пустой dashboard для нового user рендерится с empty states (не падает на null).

8. **Daily Blunder `/daily-blunder`.**
   Logic spec в §8. Новая таблица `daily_blunder_attempts`. Server action `getOrCreateTodaysBlunder(userId)` возвращает либо текущую попытку, либо создаёт новую из подходящего `critical_moments` row. UI: board с `fen_before`, drag-and-drop ход, server-action submit. Streak обновляется на successful solve.
   *Acceptance:* user видит позицию из своей собственной партии 2-дневной давности; правильный ход даёт ✓ + streak +1; неправильный — coach explanation без credit.

9. **Leaderboard snapshot job + UI.**
   - `app/api/cron/leaderboard-snapshot/route.ts` — Vercel Cron handler. Защита: проверка `Authorization: Bearer ${CRON_SECRET}` (env var). Использует `getSupabaseServiceRoleClient`, считает score per city, upsert в `leaderboard_snapshots`.
   - `vercel.json` (или `vercel.ts`) добавляет crons block: `[{ path: "/api/cron/leaderboard-snapshot", schedule: "5 0 * * *" }]`.
   - `/leaderboard` page: server-loaded latest snapshot для default-city юзера, фильтр-таб для других городов, top-10 row с avatar, name, score delta, badge.
   *Acceptance:* manual hit `curl -H "Authorization: Bearer …" /api/cron/...` пишет 4 row в `leaderboard_snapshots` (по одной на город), UI рендерит их в течение секунды.

10. **Pro page `/pro`.**
    Marketing-page без auth gating. Три tier-карточки (Free / Pro / School), comparison-table 8 features × 3 tiers с галочками/прочерками. CTA «Join Pro waitlist» открывает inline-форму с email; submit пишет в новую таблицу `waitlist_signups (email, source, created_at)` через server action. Public-write RLS policy с rate-limit (1 email per IP per hour — через `request.headers['x-forwarded-for']` или просто trust для прототипа).
    *Acceptance:* email validates, дубликат показывает «You're already on the list», success-state показывает место в очереди.

11. **Carry-over test gates.**
    - `playwright.config.ts` + `e2e/play-to-review.spec.ts`: anon flow (без auth) — open `/play` → make 4 moves → resign → click Review → assert ≥ 1 critical-moment-card visible. Использовать MCP-managed test-DB или мокать Supabase responses.
    - `e2e/auth-upgrade.spec.ts`: anon → Google sign-in → assert `games` row preserved (count check).
    - `e2e/dashboard-mobile.spec.ts`: viewport 375×667, screenshot match.
    - `e2e/daily-blunder.spec.ts`: solve happy path.

12. **Documentation.**
    Update `docs/deployment.md` Phase 3 sections: Google OAuth credentials, Vercel Cron secret env, supabase types regeneration step. Bump README со ссылкой на demo + список фич Phase 3.

---

## 5. Auth Spec

### 5.1 Identity model

Один `auth.users.id` (UUID) — единственный долговечный идентификатор. Анонимная сессия Phase 2 = такой же UUID, просто без email/identity. Phase 3 апгрейдит сессию: добавляет identity (Google или email), не меняет UUID. Все Phase 2 строки в `games`/`game_reviews`/`critical_moments` остаются доступны.

### 5.2 Helper `lib/auth/upgrade.ts`

```ts
type Provider = "google" | "email";

export async function upgradeOrSignIn(opts: {
  provider: Provider;
  email?: string;          // for "email"
  redirectTo: string;
}): Promise<UpgradeResult> { ... }
```

Поведение:

| Текущая сессия | provider="google"             | provider="email"              |
| -------------- | ----------------------------- | ----------------------------- |
| anon           | `auth.linkIdentity({google})` | `auth.updateUser({email})` ¹ |
| authed         | _(no-op, redirect to dash)_   | _(no-op)_                     |
| none           | `auth.signInWithOAuth({google})` | `auth.signInWithOtp({email})` |

¹ `updateUser({email})` отправит подтверждение на новый email. После того как юзер кликнет ссылку — email становится primary identity для того же UID.

### 5.3 Callback route

`app/auth/callback/route.ts`:

1. Принимает `code` (OAuth) или `token_hash` (email magic link).
2. `supabase.auth.exchangeCodeForSession(code)` (или `verifyOtp` для email).
3. Если `profiles` row отсутствует или incomplete — redirect `/onboarding?next=...`.
4. Иначе — redirect на `next` query param или `/dashboard`.
5. На любую ошибку — `/sign-in?error=<code>`.

### 5.4 Edge cases

- **Юзер залогинился под Google, но в anon-сессии уже были партии.** `linkIdentity` сохранит UID, партии останутся. ✅
- **Юзер с anon-партиями делает sign-in на другом устройстве.** Получает новый UID — anon-партии остаются на первом устройстве. Не пытаемся merge'ить (out of scope).
- **Email уже есть у другого user_id.** `updateUser({email})` вернёт ошибку. UI показывает «This email is already linked to another account. Sign out and sign in with that account instead.»
- **OAuth callback failure (network, declined).** `?error=<code>` — UI рендерит retry с человеческим сообщением.

---

## 6. Onboarding Spec

`/onboarding` — двухшаговая форма, накладывается поверх обычного app shell без sidebar.

**Step 1 — Skill level:** три большие радио-карточки (Beginner / Intermediate / Advanced) с короткими подписями («I know the rules and play casually» / «I can spot tactics and use openings» / «I play tournaments / above 1500 ELO»).

**Step 2 — City:** четыре радио-чипа (Almaty / Astana / Shymkent / Other). Подсказка: «Used for the local leaderboard. Pick the closest one.»

Submit → server action `completeOnboardingAction({skill, city, displayName?})` → upsert `profiles` row с `default_difficulty=skill`, `city`, optional `display_name` (взять из Google identity если есть). Redirect на `/dashboard`.

Skip-логика: если `profiles` row уже complete (city + default_difficulty заполнены), middleware пропускает onboarding мимо.

---

## 7. Dashboard Spec

### 7.1 Layout

- **Mobile (default):** vertical stack — Streak / Top weakness / Daily Blunder / Recent reviews / Pattern trend / City rank.
- **Desktop (≥1024):** 12-col grid. Левый столбец 8/12 — Pattern trend chart на 4-row, Recent reviews на 4-row. Правый 4/12 — Streak, Top weakness, Daily Blunder, City rank карточки в колонку.

### 7.2 Streak SQL

```sql
with daily_activity as (
  select date_trunc('day', created_at)::date as day
  from public.game_reviews
  where user_id = $1
  union
  select date_trunc('day', completed_at)::date
  from public.daily_blunder_attempts
  where user_id = $1 and success = true
),
distinct_days as (select distinct day from daily_activity order by day desc),
gaps as (
  select day,
    day - row_number() over (order by day desc) * interval '1 day' as grp
  from distinct_days
)
select count(*) as streak
from gaps
where grp = (select grp from gaps order by day desc limit 1);
```

Запускается при загрузке dashboard. Если стрик > 30 дней — кешируем результат на 5 минут в Supabase Storage / KV (на потом — пока считаем каждый раз).

### 7.3 Top weakness aggregation

```sql
select main_category, count(*) as freq
from public.game_reviews
where user_id = $1
  and main_category is not null
  and created_at >= now() - interval '7 days'
group by main_category
order by freq desc
limit 1;
```

### 7.4 Empty states

Каждая карточка должна красиво отрендериться при нулевых данных:
- Streak: «Start a streak — review your first game.»
- Top weakness: «Play a few games. Your patterns will surface here.»
- Daily Blunder: «Today's blunder will appear after your second game.»

---

## 8. Daily Blunder Spec

### 8.1 New table

```sql
create table public.daily_blunder_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  moment_id uuid not null references public.critical_moments(id) on delete cascade,
  attempt_date date not null default ((now() at time zone 'utc')::date),
  user_move text,
  success boolean not null default false,
  revealed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, attempt_date)
);
```

RLS: own-row select/insert/update.

### 8.2 Picking a moment

```sql
select cm.*
from public.critical_moments cm
where cm.user_id = $userId
  and cm.id not in (
    select moment_id from public.daily_blunder_attempts where user_id = $userId
  )
  and cm.severity in ('mistake', 'blunder')
order by random()
limit 1;
```

Если ничего не подходит — fallback на самый старый critical_moment даже если уже показывали (юзер не запомнил спустя месяц).

### 8.3 UI flow

1. Load `/daily-blunder` → server action `getOrCreateTodaysBlunder(userId)` возвращает `{moment, attempt}`.
2. Показать board с `moment.fen_before`, скрыть best_move, подпись «From your game N days ago».
3. User делает ход на доске (read-write `<ChessBoardWrapper>`). Submit → `submitDailyBlunderAttemptAction({attemptId, uci})`.
4. Server action: сравнить `uci` с `moment.user_move` или `moment.best_move`. **Логика:** успех если `uci == moment.best_move` (юзер нашёл правильный ход). Если `uci == moment.user_move` — повторил ту же ошибку. Иначе — другой неправильный ход.
5. Возврат: `{success, correctMove, explanation, trainingHint}`. Если success — обновить `attempts.success=true, completed_at=now()`.
6. UI рендерит результат-карточку: ✓ / ✗ + AI Coach explanation из `moment.explanation`.

«Reveal» button (без попытки) — обновляет `attempts.revealed_at`, не меняет success. Streak credit не даётся.

---

## 9. Leaderboard Spec

### 9.1 Score formula (decisions.md §7)

```
score(user, city, period_end) =
  avg_blunders_per_game(user, period_end - 7d, period_end)
  - avg_blunders_per_game(user, period_end - 14d, period_end - 7d)
```

Чем более негативный score — тем больше прогресса (меньше blunders). Tie-break: больше reviewed games за last 7 days.

Eligibility: ≥ 5 reviewed games за last 7 days, `profiles.city is not null`.

### 9.2 Cron implementation

`app/api/cron/leaderboard-snapshot/route.ts`:

```ts
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... compute score per (user, city) over last 7d/14d windows, ranked
  // ... upsert into leaderboard_snapshots
}
```

`vercel.ts` (новый, заменяет необходимость в `vercel.json`):

```ts
import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  crons: [
    { path: "/api/cron/leaderboard-snapshot", schedule: "5 0 * * *" }
  ],
};
```

`CRON_SECRET` — random 32-byte hex, добавляется в Vercel env (Production only).

### 9.3 UI

Tabs по городам, default — `profiles.city` юзера. Top-10 row: rank, display_name, score-delta (зелёная отрицательная, красная положительная), reviewed-count бэдж. Если у юзера < 5 reviewed games за неделю — баннер «Review 5 games this week to enter the leaderboard.»

---

## 10. Pro Page Spec

### 10.1 Tiers

| Feature                          | Free | Pro $4.99/mo | School (custom) |
| -------------------------------- | ---- | ------------ | ---- |
| Play vs Stockfish (3 levels)     | ✓    | ✓            | ✓ |
| Game Reviews / day               | 3    | unlimited    | unlimited |
| AI Coach explanations            | basic | deep         | deep |
| Pattern history                  | 7 days | full       | full |
| Daily Blunder                    | ✓    | ✓            | ✓ |
| Goal Focus / Pattern Drill modes | preview | ✓         | ✓ |
| Deep Review mode                 | —    | ✓            | ✓ |
| Weekly training plan             | —    | ✓            | ✓ |
| City Leaderboard                 | ✓    | ✓            | ✓ |
| Custom board / piece skins       | roadmap | roadmap  | roadmap |
| Shareable progress cards         | —    | ✓            | ✓ |
| Coach dashboard for students     | —    | —            | ✓ |
| Class leaderboard                | —    | —            | ✓ |

### 10.2 Waitlist

```sql
create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,           -- "pro" | "school"
  created_at timestamptz not null default now(),
  unique (email, source)
);
```

RLS: insert-only public, no select. Email validation через Zod. Дубликат → friendly «You're already on the list» (поймать `unique_violation` через error code `23505`).

### 10.3 Visual

Pricing cards в стиле Linear / Vercel: Pro card подсвечен через accent border, sub-text «Most popular», цена крупно. Comparison table — sticky-header при скролле. Под таблицей — три коротких отзыва-плейсхолдера (можно с подписью «coming soon»).

---

## 11. Type-Safe Supabase Client

### 11.1 Generation

```sh
pnpm dlx supabase gen types typescript \
  --project-id tsijruonmfrwydtdmpdx \
  --schema public > lib/supabase/database.generated.ts
```

Этот файл попадает в git. При изменении схемы — регенерируется. В CI можно добавить шаг проверки drift, но для прототипа достаточно «обновить руками после миграции».

### 11.2 Wire-up

```ts
// lib/supabase/browser.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.generated";

let cached: SupabaseClient<Database> | null = null;
// ... return SupabaseClient<Database>
```

Аналогично в `server.ts`. Удаляем самописный `lib/supabase/database.types.ts` (Phase 2 stop-gap) после миграции.

### 11.3 Side effects

Все вызовы `.from('games').insert({...})` теперь typecheck'ятся против схемы. Любая опечатка в имени колонки — compile-time error. Это поможет ловить будущие миграции, которые ломают код.

---

## 12. Carry-over Test Gates from Phase 2

Phase 2 §13 оставила три открытых пункта. Они закрываются здесь как условие acceptance.

### 12.1 Playwright e2e

`playwright.config.ts` + `e2e/`:

- `play-to-review.spec.ts` — anon happy path: открыть `/play`, сделать 4 хода через `page.click()` на target-square, нажать Resign → `[data-testid="review-cta"]` стало enabled с href `/review/...`, переход → `[data-testid="critical-moment-card"]` появилось хотя бы одно (или clean-game state).
- `auth-upgrade.spec.ts` — Google login через mock OAuth (Supabase test mode) → проверить, что count `games` для UID не упал.
- `daily-blunder.spec.ts` — load `/daily-blunder` (после логина с готовыми critical_moments), submit best_move через UI → success state.

Локально гонятся через `pnpm test:e2e`. CI добавляется в Phase 4 если будет GitHub Actions.

### 12.2 Mobile snapshot

`e2e/dashboard-mobile.spec.ts` — viewport 375×667, snapshot `/dashboard` после логина. Снэпшот хранится в `e2e/__snapshots__/`. Flaky-tolerant через `toHaveScreenshot({maxDiffPixelRatio: 0.02})`.

### 12.3 Reduced-motion

Простой проверочный тест в `e2e/reduced-motion.spec.ts`: emulate `prefers-reduced-motion: reduce`, открыть `/review/[gameId]` в loading state, проверить что progress-bar transition `duration` ≤ 10ms (через `getComputedStyle`).

---

## 13. Acceptance Criteria

Phase 3 done, когда:

1. Новый посетитель landing видит «Sign in» / «Start training» CTA. Sign in работает через Google и через email magic link.
2. Анонимный пользователь, отыгравший партию в Phase 2-режиме, может сделать sign-in и **видит ту же партию** в `/dashboard → Recent reviews`.
3. После первого sign-in юзер попадает в onboarding, выбирает skill + city, оказывается на `/dashboard`.
4. Dashboard рендерит все 6 карточек (даже на пустых данных — empty states), без 500 / hydration ошибок.
5. `/daily-blunder` показывает позицию из прошлой ошибки юзера. Правильный ход → success + streak +1. Неправильный → coach explanation, streak без credit.
6. Cron job выполняется ежедневно в 00:05 UTC, пишет 4 row в `leaderboard_snapshots`. `/leaderboard` рендерит список из последнего snapshot за < 1 секунду.
7. `/pro` страница рендерится с тремя tier'ами и таблицей. Email-форма принимает валидный email и пишет в `waitlist_signups`. Дубликат показывает friendly-message.
8. `/settings` позволяет изменить city и default_difficulty; изменение `city` отражается на leaderboard-фильтре.
9. Middleware блокирует доступ к `/dashboard`, `/daily-blunder`, `/leaderboard`, `/settings` без authed-сессии (анонимная не считается).
10. `pnpm typecheck` зелёный против сгенерированных Supabase-типов; нет `as any` в новом коде.
11. Vitest + Playwright: оба зелёные. Coverage Phase 2 + Phase 3 ≥ 75%.
12. Supabase advisors: 0 security WARN после новых миграций (`daily_blunder_attempts`, `waitlist_signups`).

---

## 14. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| `linkIdentity` ведёт себя нетривиально — например, если у Google email уже есть user_id | Перед link'ом проверяем `auth.admin.listUsers({email})`; если найден другой UID, показываем friendly conflict-screen и предлагаем sign-out + sign-in с тем аккаунтом. Тестируется в `auth-upgrade.spec.ts` явным сценарием. |
| Vercel Cron не запустился (incident, hot-fix-pause) | UI деградирует gracefully — если последний snapshot старше 25h, показываем баннер «Updating leaderboard…». Можно вручную дёрнуть `/api/cron/...` admin-запросом. |
| Streak SQL медленный для активных юзеров (тысячи review-row) | Кешируем результат в `profiles.cached_streak`, обновляем триггером на `game_reviews` insert (или отдельным background job). Не делаем сразу — только если EXPLAIN ANALYZE покажет > 100ms. |
| `daily_blunder_attempts` исчерпывает все critical_moments юзера | Fallback на самый старый moment (см. §8.2). Долгосрочное решение: в Phase 4 ввести «синтетические» blunder-puzzles похожих паттернов, не привязанные к собственным партиям. |
| Pro waitlist получает спам (бот наполняет таблицу) | На server action: rate-limit per IP (15 запросов/час, в memory или Redis), honeypot-поле в форме, simple regex против явных мусорных доменов. Без CAPTCHA — слишком тяжёлая UX для прототипа. |
| Auth callback redirect-loop при кривой `next` query | Whitelist путей в callback: только относительные `/...` пути и только из заранее известного списка. Любой `http://...` → fallback на `/dashboard`. |
| Тypegen Supabase ломается при изменении схемы локально (рассинхрон) | Скрипт `pnpm db:types` в package.json + комментарий в README + lefthook pre-commit hook, который ругается если миграция изменилась без обновления generated.ts. |

---

## 15. Phase 3 → Phase 4 handoff

Phase 4 (polish + demo, decisions.md §10):
- Demo video через Remotion / HyperFrame (45–75s, по сценарию из PRD §8.6).
- Final landing polish: real screenshots, demo-video embed, customer-style testimonial placeholders, animations через Framer Motion.
- RU локаль через `next-intl` + `[locale]` URL prefix migration. KZ остаётся roadmap.
- README pitch-format со скриншотами и demo GIF.
- Submission package для nFactorial: short intro doc, link list, video.

Phase 3 ничего из этого не трогает.

---

## 16. Planning Rule

Phase 3 не открывает новых поверхностей сверх зафиксированных в §3 «In scope». Если по ходу работы возникнет соблазн добавить что-то «по дороге» (push-уведомления, friends-list, multiplayer-link, advanced theme-customisation) — это пишется как тикет и идёт либо в Phase 4 polish, либо в backlog.

UI-блоки для dashboard, daily blunder, leaderboard и pro page строятся поверх существующих shadcn-style примитивов (`Card`, `Button`, `Badge`) и Recharts. Новые визуальные элементы добавляем только если конкретный экран не складывается из имеющегося набора — по принципу «extract when needed, not before».

Только после прохождения acceptance criteria §13 переходим к Phase 4 plan.
