# BlunderLab — Phase 5 Plan

Дата: 2026-05-02
Статус: scope memo — post-submission, не sprint plan
Source of truth: [../decisions.md](../decisions.md)
Связанные документы: [../PRD.md](../PRD.md), [../design-document.md](../design-document.md), [../CJM.md](../CJM.md), [./phase-1.md](./phase-1.md), [./phase-2.md](./phase-2.md), [./phase-3.md](./phase-3.md), [./phase-4.md](./phase-4.md)

---

## 1. Purpose

Фазы 1–4 закрывают submission-scope. Phase 5 — это **финальный спринт перед submission**: всё, что нужно дописать из PRD к концу 3 мая 2026, прежде чем продукт будет считаться готовым.

Дедлайн жёсткий: **23:59 3 мая 2026.** Никакого «после nFactorial» нет — проект завершается с подачей. Поэтому Phase 5 — это последний слой scope, который прибавляется к Phase 4 polish'у:

- закрываем retention-механики из PRD §7.4 / §11 (training goal continuity, identity labels, weekly weakness, public profile, light theme);
- ставим минимальные метрики и feedback-loop (PRD §13);
- демонстрируем Pro-ценность через placeholder без реальных платежей (PRD §12);
- доводим mobile-experience до уровня PWA-feeling (PRD §8.5);
- закрываем оставшиеся PRD-пункты: Chess for Builders позиционирование, Real Opening Book для качества review, shareable cards, suggested drill;
- минимальный legal layer (Privacy/Terms/Cookies) для credible submission;
- базовая observability (Sentry + cron alerting), без Stripe-grade hardening.

Главная цель Phase 5:

> К концу 3 мая иметь **PRD-complete версию продукта** в рамках realistic-scope для летней программы — со всем, что видно пользователю и комиссии, и без infrastructure-overkill, который не оправдан без реального трафика.

Phase 5 идёт **последовательно после Phase 4**. Если Phase 4 не закрыт — Phase 5 не начинается; submission режется по самой нижней допустимой границе acceptance criteria Phase 4.

---

## 2. PRD Gap Analysis

Что из PRD **не закрыто** фазами 1–4 и что мы решили делать / отложить.

### 2.1 В scope Phase 5

| PRD § | Пункт | Где сейчас | Под-фаза |
| --- | --- | --- | --- |
| §7.4 | Training Goal continuity в next game (overlay «Current goal: reduce hanging pieces») | nowhere | 5a |
| §9.2 | Light/dark theme toggle | dark-only | 5a |
| §11.2 | Weekly Weakness explicit view с reduction («from 5.2 to 3.1») | partial — dashboard mode только за 7д | 5a |
| §11.5 | Identity labels: Blunder Hunter, Calm Defender, Tactical Sprinter, Opening Gambler, Endgame Survivor, Pattern Seeker | nowhere | 5a |
| §15 | Public profile page (отдельно от /settings) с badges, history, identity label | settings only | 5a |
| §13.1 | Activation funnel events (registration → first game → first review → first critical moment view → second game) | Vercel Analytics page-views only | 5b |
| §13.2 | Retention metrics: D1, D7, games reviewed per user, daily blunder completion, repeated pattern reduction | nowhere | 5b |
| §13.3 | User feedback mechanism на AI Coach explanation («helpful / not helpful») | nowhere | 5b |
| §13.3 | «% users who clicked show best move» (best move сейчас всегда показан, нет reveal-механики) | always-visible | 5b |
| §13.4 | Willingness-to-pay survey + «most desired Pro feature» prompt | nowhere | 5b |
| §12.2 | Pro tier UI: показать ценность, **placeholder «Payments coming soon»** | waitlist only | 5c |
| §12.4 | Cosmetic skins functional: 4 board palettes + 2 piece sets (демонстрация Pro-value, без real payment'ов) | promise on Pro page | 5c |
| §8.5 | **Mobile-first deep optimization**: PWA, touch-gestures, bottom-sheet, safe-area-inset, native share | базовый responsive | 5d |
| §9.3 | Shareable review cards через `@vercel/og` | nowhere | 5d |
| §11.2 | Weekly report **dashboard view** `/dashboard/weekly` (без email — нет custom domain для Resend) | nowhere | 5d |
| §13.3 | Suggested drill flow (3 mini-puzzles на тот же pattern) | training goal — текст, не drill | 5d |
| §5.2 | Chess for Builders landing variant `/builders` с альтернативным copy для CS-аудитории | nowhere | 5d |
| §10.3 | Real opening book для Opening Drift detector (lichess masters JSON, ECO codes) | heuristic only | 5d |
| Phase 4 risk | Server-side error tracking (Sentry) | Vercel Analytics + console | 5e |
| Phase 3 risk | Cron job alerting (если snapshot не записан 2 дня — alert) | manual check | 5e |
| Phase 4 risk | Privacy / Terms / Cookies pages, cookie banner, GDPR data export/delete | placeholder footer | 5e |

### 2.2 Out of scope для submission 3 мая (явно вычеркнуто)

| PRD § | Пункт | Почему не делаем |
| --- | --- | --- |
| §12.2 | **Реальный Stripe checkout** | Летний прототип. Placeholder «Payments coming soon» убедителен; Stripe требует webhook'ов, KYC, refund flow — не оправдано без реального трафика |
| §9.3 | **Multiplayer by link** | Не блокирует submission. Single-player vs Stockfish уже даёт полный review-flow — это и есть продукт |
| §9.3 | **Weekly report email** | Resend требует verified custom domain. У нас только Vercel-domain (`*.vercel.app`) — отправка с него заблокирована. Заменяем на in-app dashboard view `/dashboard/weekly` |
| §12.3 | **School / Team tier functional** | UI-карточка на Pro page как teaser достаточна для демонстрации B2B-гипотезы |
| decisions.md §11 | **KZ-локаль** | EN+RU из Phase 4 покрывают и nFactorial-комиссию, и core-аудиторию |
| Phase 3 risk | **Account merge** для anon-сессий с двух устройств | Edge-кейс на низкий трафик. Не проявится в demo |
| Phase 3 risk | **Rate limiting через Upstash Redis** | Review free-tier лимит уже enforced server-side. Без реального трафика дополнительный middleware не оправдан |
| Web Push API | **Push notifications для Daily Blunder** | Требует серверной VAPID-инфраструктуры и subscription storage; не помещается в submission-deadline |

### 2.3 Закрыто фазами 1–4 — не трогаем



- Все 9 must-have экранов из PRD §9.1 (board, play, history, auth, supabase, review, top 3 mistakes, blunder pattern, dashboard, responsive UI).
- AI Coach summary (PRD §9.2 should-have).
- Daily Blunder, City Leaderboard, Pro page (waitlist), Streak за анализ.
- Blunder taxonomy 8 категорий с детектором.
- Engine pipeline + critical moments detection.
- Auth (Google + magic link), onboarding (skill + city).
- i18n EN+RU, demo video, README mini-pitch, submission материалы (Phase 4).

---

## 3. Phase 5 Scope

Времени до submission ≈ 1 рабочий день после Phase 4. Поэтому каждая под-фаза имеет **жёсткий time-budget** и **must-do / nice-to-do** разрез внутри. Если время кончилось — делаем только must-do, остальное вычеркиваем.

### 5a — Retention completion (budget ~4–5h)

**Must-do:**
- Training Goal continuity в Play screen — sticky banner с current goal над доской + dismiss-button. Без self-check checkbox после партии.
- Identity labels (6 шт. из PRD §11.5) с автоматическим присвоением — расчёт inline в server action `getProfileWithLabel`, не cron. UI badge в app shell.
- Weekly Weakness explicit карточка в dashboard с reduction-arrow (current 7d vs prior 7d).
- Light theme toggle через `[data-theme="light"]` в `app/globals.css` + ThemeProvider в layout.

**Nice-to-do (если успеваем):**
- Public profile `/u/[handle]` с identity label, badges, recent reviews summary, `is_public_profile` toggle в /settings.

### 5b — Metrics & feedback (budget ~3–4h)

**Must-do:**
- PostHog client-side init — minimal set: `landing_viewed`, `cta_clicked`, `first_game_finished`, `first_review_opened`, `pro_page_viewed`, `pro_waitlist_joined`. ENV `NEXT_PUBLIC_POSTHOG_KEY`.
- AI Coach feedback: 👍/👎 buttons на каждом critical moment в `components/review/ai-coach-card.tsx` → пишут в новую таблицу `coach_feedback`.
- Willingness-to-pay survey modal на `pro_page_viewed` (Likert 1–5 + price-band + multi-select features).

**Nice-to-do:**
- Best move reveal-toggle (initially hidden + «Show best move» button).
- Internal `/admin/metrics` route (auth-gated через `profiles.is_admin=true`) с server-loaded аггрегациями.

### 5c — Pro placeholder + cosmetic skins (budget ~3–4h)

**Must-do:**
- Pro page (Phase 3 уже даёт скелет): расширить до полного tier-сравнения (Free / Pro / School), 8 features × 3 tiers таблица, реальные feature-блоки.
- CTA «Upgrade to Pro» → modal «Payments coming soon. Join the early-access list.» → email-capture в существующий `waitlist_signups (source='pro_upgrade')`.
- `profiles.subscription_tier enum('free','pro','school') default 'free'` + миграция; manual server-side flag (admin SQL `update profiles set subscription_tier='pro' where id=...`).
- Server-side enforcement только базово: если `tier='pro'` → `REVIEW_DAILY_LIMIT=∞`, иначе 3/day (как сейчас).
- Cosmetic skins: **4 board palettes** (Graphite default, Warm minimal, Lab, Wood) — реализуются через CSS variables на `<ChessBoardWrapper>`. Free → Graphite only; Pro flag unlock остальные. Storage в `profiles.preferences.board_theme`.

**Nice-to-do:**
- 2-й piece set (Minimal alt). Cburnett остаётся default.
- `gpt-4o` для Pro deeper coach (вместо `gpt-4o-mini`) — простая ветка в `lib/coach/openai.ts` по `tier`.

### 5d — Mobile-first + Builders + Opening Book (budget ~5–7h)

**Must-do:**
- **PWA basics**: `app/manifest.ts`, simple service worker через `next-pwa` или ручной `public/sw.js`, install-prompt logic.
- **Safe-area-inset support** в global CSS для iOS notch/home-indicator.
- **Native share sheet** через Web Share API в review screen (fallback на copy-to-clipboard на desktop).
- **Touch-optimized chessboard**: увеличить hit-area legal-square highlight; haptic feedback через `navigator.vibrate(10)` на legal move (no-op на desktop).
- **Bottom-sheet patterns** для review filter и settings на mobile (Radix Dialog + custom slide-up animation).

**Must-do (Builders + Opening Book):**
- **Chess for Builders landing variant** — `/builders` route, переиспользует `(marketing)/page.tsx` секции с разной copy ("Pattern recognition is your superpower. Train it on chess."). Hero + How-it-works + Pattern taxonomy + CTA. Идентичен по компонентам, разные strings — добавить namespace `builders.*` в `messages/{en,ru}.json`.
- **Real Opening Book** для Opening Drift detector. Скачать `lichess-eco.tsv` (CC0) → конвертировать в `lib/chess/opening-book/eco.json` (~50KB). В `lib/chess/taxonomy.ts` — `isInBook(fen)` проверка перед триггером Opening Drift. Если позиция в книге → детектор не срабатывает.

**Nice-to-do:**
- **Shareable review cards** через `@vercel/og` — `/share/[reviewId]/og.png`. Требует public-flag `game_reviews.is_public default false`, toggle в /settings.
- **Suggested drill flow** — `/drill/[goalId]` с 3 mini-puzzle на тот же pattern из чужих anonymized partий. Reuse существующий `<ChessBoardWrapper>`.
- **Mobile gestures** swipe-left/right между critical moments в review.

### 5e — Minimal hardening (budget ~2–3h)

**Must-do:**
- Sentry: `pnpm add @sentry/nextjs` + `pnpm exec sentry-wizard -i nextjs` (auto-config). ENV `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`. Free tier достаточен.
- Privacy / Terms / Cookies pages — короткий generated text через iubenda/termly free tier (или ручной placeholder с пометкой «prototype, not legal advice»). Routes `/privacy`, `/terms`, `/cookies`.
- Cookie banner — `components/legal/cookie-banner.tsx`, 3 buttons (Accept / Reject / Customize), persist в `localStorage.consent`. PostHog инициализируется только при `analytics=true`.

**Nice-to-do:**
- Cron alerting — Slack webhook на `/api/cron/leaderboard-snapshot` failure. ENV `SLACK_ALERT_WEBHOOK`.
- GDPR data export `/settings → Export my data` — server action генерит JSON dump через `Promise.all` от 5 таблиц.
- GDPR hard-delete — расширение Phase 3 soft-delete до cascade-delete через Supabase admin API.

### Out of scope для submission 3 мая

См. §2.2 для полного списка с обоснованиями. Кратко:
- Real Stripe checkout
- Multiplayer by link
- Weekly report **email** (только dashboard view `/dashboard/weekly`)
- School / Team tier functional
- KZ-локаль
- Account merge для anon-сессий
- Rate limiting через Upstash Redis
- Web Push notifications
- Real-time multiplayer matchmaking, ELO, турниры
- Mobile native iOS/Android apps
- AI Coach как live chat в партии
- Социальная сеть, UGC marketplace, live integrations

---

## 4. Implementation Order (1-day sprint, 3 мая)

Total budget: ~17–22h работы при оптимистичном раскладе. Реально доступно ≤ 12h. Поэтому порядок — **по visibility для комиссии**, не по архитектурной чистоте. Делаем то, что видно на screenshots/в demo-video, прежде чем то, что под капотом.

**Order:**

1. **5a must-do (training goal banner + identity labels + weekly weakness card + light theme).** ~3h.
   Это видимые retention-фичи из PRD §7.4 / §11. Светлая тема и identity badge сразу прибавляют product-feel в скриншотах.

2. **5c must-do (Pro page expanded + placeholder modal + 4 board palettes).** ~2h.
   Pro page и cosmetic skins — главный business-thinking demo. «Payments coming soon» — корректный сигнал прототипа.

3. **5d must-do (PWA basics + safe-area + touch + bottom-sheet + Builders + Opening Book).** ~5h.
   Mobile-first — критично для mobile-аудитории nFactorial. Builders landing — IT-positioning. Opening Book — улучшает review-quality.

4. **5b must-do (PostHog minimal + AI Coach feedback + WTP survey).** ~2h.
   Метрики собираются с момента deploy — если не поставим до submission, потеряем первую неделю активации.

5. **5e must-do (Sentry + Privacy/Terms/Cookies + cookie banner).** ~2h.
   Sentry даёт post-deploy observability. Privacy/Terms/Cookies — credible legal layer для submission.

6. **Nice-to-do по любой под-фазе** (5a public profile, 5b best move toggle, 5c piece set, 5d shareable cards / drill / gestures, 5e cron alerting / GDPR export).
   Делаем только если осталось время после §1–5 must-do и зелёных smoke-tests Phase 4.

**Cut-rule:** в 21:00 3 мая — стоп. Что не сделано — отрезается, не сдвигает submission. Явный stop-hour важнее «ещё одной фичи».

---

## 5. 5a — Retention Completion

### 5.1 Training Goal continuity в Play screen

Phase 2 даёт CTA `Play again with this goal` → `/play?goal=<id>`. Phase 5a реализует **только баннер** (self-check + goal streak — nice-to-do):

- Server action `loadActiveGoal(userId)` читает последний `training_goal` из `game_reviews`.
- В Play screen — sticky banner вверху доски: «Current goal: Before every attacking move, check if your king is safe.» + dismiss-button.
- Без `?goal=<id>` query — баннер всё равно показывает последний training_goal (наиболее свежий из всех reviews).

Acceptance: пользователь после review нажимает CTA → попадает в /play, видит свой goal как баннер. Open `/play` напрямую — баннер тоже показывается с last training_goal (если есть ≥ 1 review).

### 5.2 Identity labels

PRD §11.5 фиксирует 6 labels:
| Label | Trigger |
| --- | --- |
| Blunder Hunter | reviewed ≥ 20 games в прошлом месяце |
| Calm Defender | < 10% blunders из категории Time Panic + Tunnel Vision |
| Tactical Sprinter | ≥ 70% Daily Blunder solve-rate за месяц |
| Opening Gambler | ≥ 30% игр с deviation в opening (Opening Drift triggered, win-rate ≥ 50%) |
| Endgame Survivor | ≥ 50% побед/draws в games с < 12 фигурами |
| Pattern Seeker | reduced ≥ 2 разных категорий blunder month-over-month |

- Расчёт — **inline в server action** `getProfileWithLabel(userId)` при загрузке dashboard / app shell. Кэшируется на 5 минут в-memory (`profiles.identity_label_cached_at`).
- Без cron job — для submission-deadline это нерационально. Cron можно добавить позже если labels будут пересчитываться часто.
- UI — badge в app shell user-menu + на review summary card. Toast «You earned: Pattern Seeker» — nice-to-do.
- На пустых данных (нет reviews) — fallback label «Newcomer» без trigger (не из PRD списка, локализованный в messages).

### 5.3 Weekly Weakness explicit card

Текущий dashboard показывает «Top weakness this week» (mode за 7 дней). PRD §11.2 требует comparison с прошлой неделей:

> «Your top weakness this week: Loose Pieces. You reduced it from 5.2 to 3.1 per game.»

- Новый SQL aggregation: avg `main_category` count per game, current 7d vs prior 7d.
- Карточка в dashboard с reduction-arrow (зелёный ↓ если уменьшилось, красный ↑ если выросло).
- Edge case: insufficient data (< 5 reviews либо в текущей, либо в предыдущей неделе) → текст «Need more games to compare».

### 5.4 Light theme toggle

Decisions.md §5 палитра уже на CSS variables OKLCH:
```css
--color-bg: oklch(14% 0.01 250);   /* dark default */
```

Light тему делаем через `[data-theme="light"]` selector в `app/globals.css`:
```css
[data-theme="light"] {
  --color-bg: oklch(98% 0 0);
  --color-surface: oklch(95% 0.01 250);
  /* ... */
}
```

Toggle в app shell + landing nav. Persistence — `localStorage` + `cookie` (для SSR-rendering правильной темы без flash).

### 5.5 Public profile page

`/u/[handle]` — read-only профиль. Содержит:
- Display name + avatar
- Identity label (текущий)
- Total games reviewed, current streak, top pattern
- Recent reviews (5 last public — privacy-flag в `game_reviews.is_public default false`, флипается через /settings)
- City rank position
- Joined date

`profiles.handle` — slug-friendly username, генерируется из email при onboarding (опционально override-ится в /settings).

---

## 6. 5b — Metrics & Feedback Infrastructure

### 6.1 PostHog full funnel

Установка:
```sh
pnpm add posthog-js posthog-node
```

`lib/analytics/posthog.ts` — wrapper с server-side и client-side capture. ENV `NEXT_PUBLIC_POSTHOG_KEY`.

Events (PRD §13):
| Event | When | Properties |
| --- | --- | --- |
| `landing_viewed` | landing page render | `{ locale, referrer }` |
| `cta_clicked` | hero CTA / final CTA | `{ position, locale }` |
| `auth_signup_started` | sign-in page first interaction | `{ provider }` |
| `auth_signup_completed` | callback success | `{ provider, time_to_signup }` |
| `onboarding_completed` | onboarding submit | `{ skill, city }` |
| `first_game_started` | first move in /play for new user | — |
| `first_game_finished` | game-end first time | `{ result, moves }` |
| `first_review_opened` | /review/[id] first time | `{ time_since_game_end }` |
| `first_critical_moment_viewed` | scroll past 1st critical card | — |
| `second_game_started` | second /play session | `{ from_review_cta: bool }` |
| `daily_blunder_solved` | success on /daily-blunder | `{ streak }` |
| `daily_blunder_revealed` | clicked reveal без attempt | — |
| `coach_explanation_helpful` | feedback button click | `{ critical_moment_id, helpful: bool }` |
| `best_move_revealed` | toggle click (если 6.3 реализован) | — |
| `pro_page_viewed` | /pro render | `{ source }` |
| `pro_waitlist_joined` | waitlist submit | `{ tier }` |
| `wtp_survey_shown` | hit review limit или Pro click | — |
| `wtp_survey_answered` | survey submit | `{ price_band, desired_features[] }` |

### 6.2 User feedback на AI Coach

В `components/review/ai-coach-card.tsx` — два thumb-button (👍 / 👎) под explanation. Click пишет в новую таблицу `coach_feedback (id, critical_moment_id, user_id, helpful, comment?, created_at)`.

После 👎 — показать опциональный textarea «What could be better?» (max 280 chars). Comment-rate ожидаем 5–10%.

Aggregate в `/admin/metrics` — % helpful per category, top-5 критикуемых explanations для prompt-tuning.

### 6.3 Best move reveal toggle

Сейчас best move arrow всегда видим. Меняем на initially hidden + button «Show best move». Click — fade-in arrow + capture `best_move_revealed` event. UX-цель: дать пользователю шанс сначала подумать.

A/B-test через PostHog feature-flag — control group видит сразу (как сейчас), treatment скрыт. Метрика: `engagement_score = (time_on_review × scroll_depth × revealed_count)`.

### 6.4 Willingness-to-pay survey

Триггеры:
- Hit `daily_review_limit` → modal «You've hit the free limit» + survey
- Click Pro CTA в landing/dashboard → modal перед Pro page

Survey (4 вопроса):
1. «How likely are you to upgrade to Pro?» (Likert 1–5)
2. «What price would feel fair?» ($2.99 / $4.99 / $7.99 / $9.99 / I wouldn't pay)
3. «Which Pro feature is most valuable?» (multi-select из 8 features)
4. Open: «Anything else we should add?» (optional)

Submit пишет в `wtp_responses` table. Результат — `/admin/metrics → Pricing` view.

### 6.5 Internal metrics dashboard

Два варианта:
- **A. Metabase** на отдельном Vercel project, читает Supabase через service-role Postgres connection (read-only role). Pre-built queries для активации / retention / feature usage.
- **B. Custom `/admin/metrics`** route (auth-gated через `profiles.is_admin = true`). Server-loaded аггрегации, recharts visuals.

A проще на старте, B даёт лучший integration. Выбор — после prototype.

---

## 7. 5c — Pro Placeholder + Cosmetic Skins

### 7.1 Pro page (расширение Phase 3)

Phase 3 уже даёт скелет /pro с email-capture. Расширяем до полного demo-grade:

- 3 tier-карточки (Free / Pro $4.99/mo / School custom). Pro — visual-accent через accent border + sub-text «Most popular».
- Comparison table 8 features × 3 tiers — sticky-header при скролле.
- Под таблицей — 3 testimonial-placeholder (с подписью «coming soon» — это демонстрация, не реальные отзывы).

### 7.2 Placeholder upgrade flow (БЕЗ Stripe)

CTA «Upgrade to Pro» в:
- /pro Pro card → opens modal
- /dashboard banner на hit `daily_review_limit` → opens modal
- /settings appearance section на pro-locked skin click → opens modal

Modal content:
> **Payments coming soon.**
> Pro is being finalized. Join the early-access list and we'll notify you when it goes live with founding-member pricing.
> [email field] [Join waitlist] [Maybe later]

Submit пишет в существующий `waitlist_signups (email, source='pro_upgrade', created_at)` (Phase 3 table). Дубликат — friendly «You're already on the list».

PostHog event `pro_upgrade_modal_opened` + `pro_waitlist_joined`.

### 7.3 Subscription tier infrastructure

Миграция:
```sql
alter table public.profiles
  add column subscription_tier text not null default 'free'
  check (subscription_tier in ('free', 'pro', 'school'));
```

Server-side enforcement в `app/review/actions.ts`:
- если `tier='pro'` → bypass `REVIEW_DAILY_LIMIT` check
- иначе — текущий 3/day enforcement

Manual seed для demo/testing:
```sql
-- granted manually для demo-аккаунта
update public.profiles set subscription_tier = 'pro' where id = '<demo-user-id>';
```

Это не реальная монетизация — это hook для будущего Stripe и для demo'а. Submission комиссия может попросить «покажите Pro flow» — manual-flag даёт это сделать.

### 7.4 Cosmetic skins — 4 board palettes

`profiles.preferences jsonb` (новая колонка):
```json
{ "board_theme": "graphite" }
```

4 palette в `lib/chess/board-themes.ts`:
- `graphite` (default, free) — locked palette из decisions.md §5
- `warm_minimal` (pro) — taupe/olive dark + warm cream light
- `lab` (pro) — deep blue-gray + desaturated cyan-gray
- `wood` (pro) — классический warm-brown

`<ChessBoardWrapper>` читает `preferences.board_theme` через server-loaded profile, передаёт CSS variables override в react-chessboard `customBoardStyle`.

`/settings → Appearance` — preview-grid с lock-icon на pro-only. Click на pro-locked → triggers Pro upgrade modal (§7.2).

### 7.5 School / Team tier — UI-only

School-card на /pro остаётся как teaser. CTA «Contact us» → mailto. Реальной функциональности нет (out of scope, см. §2.2).

---

## 8. 5d — Mobile-first + Builders + Opening Book

### 8.1 PWA basics

`pnpm add next-pwa` (или ручной `public/sw.js` + `app/manifest.ts` если next-pwa конфликтует с Next 16).

`app/manifest.ts`:
```ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BlunderLab",
    short_name: "BlunderLab",
    description: "AI chess coach that turns blunders into a personalized training plan.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0d",
    theme_color: "#0a0a0d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

Service worker — минимальный: cache `/`, `/play`, static assets, `/review/[id]` после первой загрузки. Без cache-first для API — review pipeline остаётся network-only.

Install-prompt — `components/pwa/install-prompt.tsx`, показывается через 2-минут engaged session (PostHog event), один раз per user (cookie `pwa_prompt_shown`).

### 8.2 Touch optimisation

- Safe-area-inset в `app/globals.css`:
  ```css
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  ```
- `<ChessBoardWrapper>` — увеличить hit-area legal-square highlight на mobile (через `customSquareStyles` с пред-rendered touch zones). Drag-and-drop уже работает через react-chessboard на touch.
- Haptic feedback — `navigator.vibrate(10)` на legal-move callback. Wrap в `if ('vibrate' in navigator)`.

### 8.3 Bottom-sheet patterns

Mobile-only — modals on mobile становятся bottom-sheets. Используем существующий Radix Dialog с custom transform:
- desktop: center modal (как сейчас)
- mobile (`< 768px`): full-width slide-up from bottom, max-height 85vh, swipe-down to dismiss

Целевые места: review filter, settings sheet (вместо full-page route на mobile для quick toggles), sign-in dialog.

### 8.4 Native share

Web Share API на review screen + `/share/[reviewId]`:
```tsx
const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      title: "Check out my chess insight on BlunderLab",
      text: criticalMoment.explanation,
      url: `${origin}/share/${reviewId}`,
    });
  } else {
    await navigator.clipboard.writeText(`${origin}/share/${reviewId}`);
    toast("Link copied");
  }
};
```

Button — «Share insight» в review summary card. Доступен на public reviews (см. §8.6).

### 8.5 Chess for Builders landing variant

`app/[locale]/(marketing)/builders/page.tsx`:
- Reuse existing `_sections/Hero`, `_sections/HowItWorks`, `_sections/PatternTaxonomy`, `_sections/CTA`.
- Передаются другие `headline`, `subhead`, `ctaCopy` через `messages/{en,ru}.json` namespace `builders.*`.
- Headline (EN): «Pattern recognition is your superpower. Train it on chess.»
- Subhead: «BlunderLab is the chess training built for builders. Spot patterns. Make decisions under pressure. Improve every game.»
- Hero composition меняется: вместо «board + critical moment + AI coach» — «board + identity label badge "Pattern Seeker" + dashboard pattern trend chart».

Не дублирует layout / nav / footer — только секционный copy.

Acceptance: `/builders` и `/en/builders` рендерятся со своим copy; nav-link «For Builders» появляется в footer обычного landing'а.

### 8.6 Real Opening Book для Opening Drift

`lib/chess/opening-book/eco.json` — извлечённый из <https://github.com/lichess-org/chess-openings> (CC0). Структура:
```ts
type EcoEntry = { eco: string; name: string; fen: string };
type OpeningBook = Record<string /* fen sans halfmove/fullmove */, EcoEntry>;
```

Размер: ~3000 entries × ~80 bytes = ~240KB JSON. Оптимизация: храним только partial-FEN ключи (без halfmove/fullmove), это снижает дубликаты.

В `lib/chess/taxonomy.ts` — изменение в Opening Drift detector:
```ts
function isOpeningDriftCandidate(input: DetectorInput): Candidate | null {
  if (!input.isOpeningPhase) return null;
  if (input.ply.evalDropCp < 100) return null;
  // NEW: check if position is in opening book
  if (isInBook(input.fenBeforeMove)) return null;
  // existing logic
  return { category: "opening_drift", reason: "..." };
}
```

`isInBook(fen)` — `book[normalizeFen(fen)] !== undefined`. Normalize — обрезать halfmove/fullmove.

Acceptance: unit-test в `lib/chess/taxonomy.test.ts` с 5 known book positions (Sicilian, French, Caro-Kann, Italian, Ruy Lopez) — все возвращают `null` для Opening Drift даже при искусственном eval drop > 1.0.

### 8.7 Shareable review cards (nice-to-do)

`@vercel/og` server-rendered OG images. `app/share/[reviewId]/opengraph-image.tsx`:
- Image 1200×630
- Composition: board snapshot (SVG-rendered FEN) + critical moment + AI coach explanation one-quote + footer «BlunderLab»
- Public-flag check: `game_reviews.is_public default false`. Public toggle в /settings.

`app/share/[reviewId]/page.tsx` — public route без auth. Renders embedded review card + CTA «Try BlunderLab on your own games».

### 8.8 Suggested drill flow (nice-to-do)

`app/[locale]/(app)/drill/[goalId]/page.tsx` — 3 позиции из той же blunder category (anonymized из чужих partий, `critical_moments.is_public_drill default false`, manually flagged seed-data для submission).

Reuse `<ChessBoardWrapper>` в interactive mode. Solve все три → success state + PostHog event `drill_completed`.

### 8.9 Mobile gestures (nice-to-do)

- Swipe-left/right между critical moments в review (через `framer-motion` `useDragControls`)
- Pull-to-refresh на dashboard через `<RefreshControl>` библиотеку или custom `IntersectionObserver` trigger

---

## 9. 5e — Minimal Hardening

### 9.1 Sentry

```sh
pnpm add @sentry/nextjs
pnpm exec sentry-wizard -i nextjs
```

Wizard auto-генерирует `instrumentation.ts`, `sentry.client.config.ts`, `sentry.server.config.ts`, обновляет `next.config.ts` с `withSentryConfig`. Source maps upload через `SENTRY_AUTH_TOKEN` ENV.

ENV в Vercel:
- `SENTRY_DSN` — public, prod + dev
- `SENTRY_AUTH_TOKEN` — secret, prod only (для source map upload)

Free tier Sentry — 5k errors/month, достаточно для submission-демо.

### 9.2 Privacy / Terms / Cookies

3 routes: `/privacy`, `/terms`, `/cookies`. Реальный текст — через iubenda/termly free tier (~5 минут на генерацию) **или** ручной placeholder с пометкой «This is a prototype submission for nFactorial Incubator 2026. Production version will have full legal review.»

Footer всех страниц получает links на эти 3 route + GitHub + decisions.md.

### 9.3 Cookie banner

`components/legal/cookie-banner.tsx`. Показывается bottom-right на first visit (cookie `consent_set` отсутствует).

3 buttons: Accept all / Reject all / Customize. Categories:
- Necessary (always on, для auth)
- Analytics (opt-in, контролирует PostHog init)
- Marketing (off, нет marketing scripts)

Storage: `localStorage.consent = { analytics: bool, marketing: bool, set_at: ISO-string }`. PostHog инициализируется в `<PostHogProvider>` только при `analytics === true`.

### 9.4 Cron alerting (nice-to-do)

`/api/cron/leaderboard-snapshot` — на success пишет в новую таблицу `cron_runs (job_name, success, ran_at)`. Отдельный cron `/api/cron/health-check` каждые 6h:
- читает последний row из `cron_runs WHERE job_name = 'leaderboard-snapshot'`
- если `now() - ran_at > 25 hours` → POST в Slack webhook (env `SLACK_ALERT_WEBHOOK`)

Если SLACK_ALERT_WEBHOOK не выставлен — alert log'ируется в Sentry как warning.

### 9.5 GDPR export / delete (nice-to-do)

`/settings → Privacy` section:
- «Export my data» → server action генерит JSON dump (profile + games + reviews + critical_moments + daily_blunder_attempts + coach_feedback + waitlist_signups если matched email) → download via `Content-Disposition: attachment; filename="blunderlab-export-{date}.json"`.
- «Delete my account» → confirm modal → server action soft-delete (Phase 3) + scheduled hard-delete через 7 дней (через `profiles.deleted_at` + manual cleanup cron в Phase 6 если понадобится).

---

## 10. Acceptance Criteria

Phase 5 done к 23:59 3 мая, когда (минимум — must-do всех sub-фаз):

**5a must-do:**
- `/play` показывает active goal как sticky banner если у user ≥ 1 review
- Identity label рассчитывается inline в server action и виден в app shell user-menu
- Dashboard содержит Weekly Weakness card с reduction-arrow (или «Need more games to compare» при insufficient data)
- Light theme toggle работает без flash на page load (cookie + `[data-theme]`)

**5b must-do:**
- PostHog инициализируется client-side, минимум 6 events приходят с правильным `user_id`
- AI Coach card имеет thumb-up/down кнопки; clicks пишут в `coach_feedback`
- WTP survey modal открывается на /pro page-view; submit пишет в `wtp_responses`

**5c must-do:**
- /pro page имеет 3 tier-карточки + comparison table 8 features × 3 tiers
- «Upgrade to Pro» CTA открывает «Payments coming soon» modal с email-capture в `waitlist_signups`
- `profiles.subscription_tier` миграция применена; manual SQL update демо-юзера до `pro` даёт unlimited reviews
- 4 board palettes доступны; free user видит только Graphite, остальные locked с upgrade-modal trigger

**5d must-do:**
- PWA manifest валиден, lighthouse PWA-checklist ≥ 7/10 пунктов
- `/builders` рендерится с альтернативным copy через `messages.builders.*`
- Real opening book подключён; unit-test на 5 known book positions проходит — Opening Drift не триггерится
- Web Share API работает на mobile review screen (fallback на copy-to-clipboard)
- Bottom-sheet pattern применён минимум к одной модалке (settings или sign-in)
- Safe-area-inset не ломается на iPhone notch (визуальная проверка через DevTools mobile emulator)

**5e must-do:**
- Sentry получает test-error с правильным release tag после `pnpm build && vercel deploy --prod`
- /privacy, /terms, /cookies routes отвечают 200 с реальным или placeholder текстом
- Cookie banner показывается на first visit, не показывается после accept; PostHog инициализация zависит от `analytics=true`

**Nice-to-do (только если время осталось после must-do):**
- 5a: /u/[handle] public profile
- 5b: best move reveal toggle, /admin/metrics
- 5c: 2-й piece set, gpt-4o для Pro
- 5d: shareable review cards, suggested drill flow, mobile gestures
- 5e: cron alerting Slack webhook, GDPR data export/delete

**Submission cut-line:** в 21:00 3 мая — стоп. Что не сделано — оставляется для будущего, submission режется по тому, что реально работает.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Time-budget превышен — Phase 5 съедает Phase 4 polish время | Cut-rule §10 — 21:00 stop. Если в 18:00 5a not done — пропускаем 5b и идём сразу к 5e (Sentry + Privacy = 30 мин и они критичны для credibility) |
| Identity labels — пустые данные у демо-юзера → пустой badge | Fallback label «Newcomer» (вне PRD §11.5 списка) для users < 5 reviews. Демо-юзер pre-seeded для submission получает Pattern Seeker через manual flag |
| Light theme — flash dark→light на page load | SSR-rendered `<html data-theme="...">` через cookie `theme`. ThemeProvider читает cookie на server, передаёт в layout |
| 5c Pro placeholder выглядит как недодел | Microcopy в modal: «Pro is being finalized. Founding members get 50% off forever.» — это намеренный design choice, не bug |
| Cosmetic skin copyright | Все 4 palettes — наши OKLCH значения (не copyrighted). Cburnett уже ships с react-chessboard (MIT). 2-й piece set — берём из открытых SVG-наборов CC0 (например, neo от Lichess, MIT) |
| Real Opening Book — JSON 240KB добавляется в bundle | Lazy-load через `await import()` только в server action `submitReviewAction`. На client не попадает |
| Sentry source maps не загружаются | `SENTRY_AUTH_TOKEN` в Vercel prod ENV, проверка после первого deploy через искусственный `throw new Error('test')` |
| Cookie banner блокирует viewport на mobile | Bottom-fixed, max-height 40vh, scroll внутри если контент длинный. Не закрывает CTA |
| Privacy text — legal blow-back в submission | Pro форма пометки «prototype submission, not legal advice»; для production — отдельный legal review, не сейчас |
| Builders landing — 2 разных контента в одном репо синхронизируются плохо | Используем те же React-секции (Hero, HowItWorks, etc.) с разными `messages.builders.*` keys. Никакого дублирования компонентов |

---

## 12. Planning Rule

Phase 5 — это **финальный полировочный спринт**, не следующая фаза развития. Никакого «Phase 6», «post-submission roadmap», «long-term roadmap» — проект завершается с подачей 3 мая.

Поэтому:

1. **Дедлайн жёсткий: 23:59 3 мая 2026.** Cut-rule в §10. Submission лучше с 60% scope чем с 100% scope в 02:00 4 мая.
2. **Must-do > Nice-to-do.** Внутри каждой sub-фазы делаем сначала must-do минимум по всем 5 (5a→5b→5c→5d→5e), потом nice-to-do по любой.
3. **Order по visibility, не по архитектуре.** §4 — то, что видно комиссии (retention badge, Pro page, mobile-first, Builders landing), идёт раньше observability.
4. **Out of scope §2.2 — святое.** Stripe, Multiplayer, Resend email, KZ-локаль, Web Push, Account merge, Rate limiting Upstash — даже если кажется «ещё пару часов». Каждая такая фича превращается в 4–8 часов и съедает всю оставшуюся фазу.
5. **PRD-gap §2.1 — единственный источник «что ещё».** Если фича не в этой таблице — её нет в Phase 5. Никаких «по дороге добавлю» решений.

После 23:59 3 мая — Phase 5 закрыт. Что не успели — то останется в backlog'е если проект продолжится после nFactorial. Если не продолжится — submission защищается тем, что реально сделано.
