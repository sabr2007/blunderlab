# BlunderLab — Phase 4 Plan

Дата: 2026-05-02
Статус: implementation pass applied — demo video deferred
Source of truth: [../decisions.md](../decisions.md)
Связанные документы: [../PRD.md](../PRD.md), [../design-document.md](../design-document.md), [../CJM.md](../CJM.md), [../deployment.md](../deployment.md), [./phase-1.md](./phase-1.md), [./phase-2.md](./phase-2.md), [./phase-3.md](./phase-3.md)

---

## Execution note — 2026-05-02

This pass implemented the submission-polish foundation: `[locale]` route migration, EN/RU message bundles, locale switcher, final landing structure, empty reserved demo-video slot, AI Coach persona lock, Vercel Analytics, OG/Twitter image, sitemap/robots/favicon, localized 404/error pages, README mini-pitch, submission one-pager, demo script, and Playwright coverage for i18n/auth/reduced-motion.

Explicit deviation: Remotion video production is deferred. The landing keeps an empty demo slot instead of embedding a generated video.

Remaining evidence tasks before final public submission: seeded Supabase Play → Review happy path, seeded mobile review/dashboard screenshots, Lighthouse measurements on deployed URLs, and actual Remotion video production.

## 1. Purpose

Phase 1–3 закрыли продуктовую механику: партия → review → pattern → goal → dashboard → daily blunder → leaderboard → pro waitlist. Это уже сервис, в который технически можно зайти и пройти весь loop. Но это всё ещё не submission-ready: лендинг placeholder, RU-локали нет, motion почти нет, демо-видео нет, README пуст, и ни один внешний человек не сможет за 10 секунд понять, **что это** и **почему это сильнее обычной шахматной доски**.

Главная цель Phase 4:

> Превратить рабочий прототип в **submission-ready продукт**, который комиссия nFactorial сможет оценить за 2–3 минуты по видео и ссылке — без необходимости лезть в код или гадать, что за продукт.

Это не про новые фичи. Это про **presentation quality** из PRD §17.4: лендинг, demo video, RU локаль, motion polish, README в формате mini-pitch и submission package. Всё, что прибавляет «product-feeling» и убирает оставшееся ощущение «coursework».

Дополнительная цель — закрыть carry-over из Phase 2/3 (Playwright Play → Review happy path с реальной Supabase, mobile snapshot для review/dashboard, reduced-motion verification) как обязательную регрессию перед демо.

---

## 2. Current Checklist

- [ ] `next-intl` middleware + `[locale]` URL-prefix migration (EN default, RU добавляется)
- [ ] `messages/en.json` + `messages/ru.json` для ВСЕХ UI-строк (landing, play, review, dashboard, daily-blunder, leaderboard, pro, settings, sign-in, onboarding, errors)
- [ ] AI Coach output на RU через `locale` в существующем prompt-builder (`lib/coach/prompts.ts`)
- [ ] Locale switcher в app shell + landing nav
- [ ] Final landing page: hero + how-it-works + product preview + pattern taxonomy + pricing teaser + demo embed + final CTA
- [ ] Real product screenshots (board critical moment, review cards, dashboard) — exported via Playwright snapshot pipeline
- [ ] Demo video (45–75s) через Remotion с EN voice-over + RU/EN субтитрами
- [ ] Demo video embedded на landing, в README и в submission материалах
- [ ] Motion pass: hero reveal, review card stagger, AI Coach reveal, dashboard counters, daily blunder answer reveal, board best-move arrow
- [ ] Reduced-motion respect — каждый animated блок имеет fallback
- [ ] README mini-pitch с product narrative, screenshots, demo GIF, tech stack, run instructions, roadmap
- [ ] Submission one-pager (`docs/submission.md`) и demo script (2–3 минуты)
- [ ] OG image + favicon set + social preview (Twitter/X, LinkedIn, Telegram)
- [ ] Sitemap.xml + robots.txt + canonical URLs per locale (hreflang)
- [ ] Lighthouse: LCP < 2.5s, INP < 200ms, CLS < 0.1 на `/`, `/play`, `/review/[gameId]`, `/dashboard` (mobile + desktop)
- [ ] Vercel Analytics или PostHog подключены (decisions.md §12 open)
- [ ] AI Coach voice locked: имя + аватар + tone-of-voice заметка (decisions.md §12 open)
- [ ] Carry-over from Phase 2/3:
  - [ ] Playwright Play → Review happy path против configured Supabase
  - [ ] Mobile snapshot 375×667 для `/review/[gameId]` и `/dashboard`
  - [ ] Reduced-motion verification для review progress bar
- [ ] Error boundaries и кастомные `app/not-found.tsx` + `app/error.tsx` (per locale)
- [ ] `pnpm build` < 60s, bundle landing < 150KB gzipped JS, app routes < 300KB

---

## 3. Phase 4 Scope

### In scope

- **i18n EN + RU через `next-intl`** — миграция flat-роутов на `app/[locale]/...`, конфиг middleware, переводы всех видимых строк, locale switcher, hreflang, AI Coach output на RU.
- **Final landing** — hero с product composition (board + critical moment + AI coach card + dashboard preview), how-it-works flow `Play → Review → Pattern → Train`, pattern taxonomy preview (8 категорий), dashboard preview, daily blunder teaser, pricing teaser (3 tier-карточки), demo video embed, final CTA. Mobile-first.
- **Demo video через Remotion** — 45–75s, scripted, по сценарию из PRD §8.6 / Design Doc §21 / §22. Renderится в `out/demo.mp4` локально, заливается на Vercel Blob (или public/) и эмбедится через `<video>`. Voice-over (EN) + dual-track субтитры (EN/RU).
- **Motion polish via Framer Motion** — hero reveal с stagger, critical moment carousel transitions, AI Coach typing reveal, dashboard counter (`useMotionValue`), daily blunder answer flip, board best-move arrow draw-in, Pro card hover lift. Все анимации respect `prefers-reduced-motion`.
- **README в формате mini-pitch** — hero screenshot, demo GIF/video link, problem framing, what makes it different, key features list со скриншотами, tech stack, run-locally instructions, future roadmap. По шаблону PRD §16.
- **Submission материалы** — `docs/submission.md` (one-pager), `docs/demo-script.md` (2–3 минуты walkthrough), список ссылок (live URL, GitHub, video, decisions.md), README-эмбед демо.
- **Carry-over Phase 2/3 тесты** — Playwright Play → Review happy path с реальной Supabase, mobile snapshot для review/dashboard, reduced-motion verification.
- **Performance + a11y polish** — Lighthouse mobile + desktop ≥ 90 на core surfaces, keyboard navigation на review-экране, screen-reader labels на board (aria-описание ходов), preload Geist Sans 500/600.
- **OG / social preview** — `app/opengraph-image.tsx` + `twitter-image.tsx`, sitemap.xml через `app/sitemap.ts`, robots.ts.
- **Error / 404 pages** — кастомные `not-found.tsx` и `error.tsx` per locale, с copy-tone из дизайн-документа.
- **AI Coach persona lock** — определяем имя ("BlunderLab Coach" по умолчанию, можно дать персональное имя), аватар (Lucide-иконка или mini-SVG), tone-of-voice notes в `lib/coach/prompts.ts`.
- **Аналитика** — Vercel Analytics (минимум) или PostHog (если хотим event-tracking для submission demo metrics: `landing_cta_click`, `first_review_complete`, `daily_blunder_solved`).

### Out of scope

- KZ-локаль (roadmap, decisions.md §11).
- Stripe / реальные платежи — Pro page остаётся waitlist.
- Multiplayer-by-link (PRD §9.3 could-have, но не Phase 4 polish).
- Training modes become the preferred Pro-value. Custom piece skins / board themes stay cosmetic roadmap only.
- Weekly report email-рассылки (PRD §9.3 could-have).
- Shareable review cards в виде image generation на сервере (image-rendered share). Если будет время — fallback на text-share через Web Share API.
- School/team coach dashboard — только UI-карточка на Pro page (Phase 3 уже это закрыл).
- Push notifications, email-нотификации Daily Blunder.
- B2B-сегмент (PRD §5.3) — оставляем как roadmap.
- Account merge для users с двумя anon-сессиями на разных устройствах (Phase 3 risk остался открытым).
- Замена `vercel.json` на `vercel.ts` — nice-to-have, делается только если попадётся под руку при правке cron-конфига.

---

## 4. Implementation Order

Порядок выбран так, чтобы ранние шаги (i18n migration, screenshots) разблокировали поздние (landing, demo video, README), и чтобы тесты-регрессии Phase 2/3 закрывались до финального deploy.

1. **Carry-over тесты Phase 2/3 — начинаем с регрессии.**
   Это первый шаг, потому что Phase 4 много двигает в коде (i18n migration, motion, новые routes). Без зелёного baseline-теста любая регрессия в полной partии Play→Review будет невидимой.
   - `e2e/play-to-review.spec.ts`: anon flow с реальной Supabase (или test-Supabase из MCP). Ходы через `data-testid` selectors на board squares, resign после 6-го хода, проверка наличия ≥ 1 critical-moment card или clean-game state.
   - `e2e/review-mobile.spec.ts`: viewport 375×667, snapshot `/review/[gameId]` после seeded review.
   - `e2e/dashboard-mobile.spec.ts`: viewport 375×667, snapshot `/dashboard` после auth seed.
   - `e2e/reduced-motion.spec.ts`: emulate `prefers-reduced-motion: reduce`, открыть review-экран в loading state, проверить что `transition-duration` ≤ 10ms на progress-bar (через `getComputedStyle`).
   *Acceptance:* `pnpm test:e2e` зелёный локально с поднятой Supabase. CI откладывается.

2. **i18n migration на `[locale]` URL prefix.**
   Это самый рискованный архитектурный шаг — все routes переезжают, все `<Link href>` и `redirect()` вызовы обновляются, auth callback URL в Supabase должен принять абсолютный путь `/auth/callback` без префикса (configurable через `localePrefix: 'as-needed'`). Глубокая спека в §5.
   *Acceptance:* `pnpm typecheck` зелёный, `pnpm test:e2e` (Phase 4 шаг 1) зелёный, `/en/play` и `/ru/play` рендерят локализованные версии, `/play` редиректит на default locale.

3. **`messages/en.json` + `messages/ru.json`.**
   Полный inventory всех видимых строк по экранам. Структура — namespace per route: `landing.*`, `play.*`, `review.*`, `dashboard.*`, `daily.*`, `leaderboard.*`, `pro.*`, `settings.*`, `auth.*`, `onboarding.*`, `common.*`, `errors.*`. RU перевод проходит ручную редактуру (не google-translate). Coach explanation остаётся динамическим через prompt — переводов в JSON нет.
   *Acceptance:* нет hardcoded EN-строки в JSX; `pnpm grep -E '"[A-Z][a-z]+ [a-z]+ [a-z]+"' app components` возвращает только tokens/console.log.

4. **AI Coach RU prompts.**
   `lib/coach/prompts.ts` уже принимает `locale`. Добавляем явный пример RU-output в few-shot части prompt (короткая ru-строка в system prompt). Fallback templates (`lib/coach/fallback.ts`) расширяем второй map по locale: `fallbackEn`, `fallbackRu`. Prompt также получает `coachVoice: 'BlunderLab Coach'` для consistency.
   *Acceptance:* unit-test на fallback для ru возвращает RU-строку; вручную проверенный live review с `?locale=ru` возвращает RU-explanation.

5. **AI Coach persona + tone-of-voice lock.**
   Закрываем decisions.md §12 open question. В `lib/coach/prompts.ts` — system prompt получает блок:
   ```
   You are BlunderLab Coach. Tone: precise, supportive, never humiliating.
   Use a chess-mentor voice — observant, calm, slightly analytical.
   Avoid filler, do not start with "Great move" or "Don't worry".
   ```
   В UI — `components/review/ai-coach-card.tsx` получает аватар (Lucide `BrainCircuit` или мини-SVG) + label "Coach". Сохраняем в `decisions.md §12` как closed.
   *Acceptance:* AI Coach card имеет visible persona; system prompt даёт consistent tone (manual check на 5 разных позициях).

6. **Motion polish.**
   Глубокая спека в §6. Список целевых анимаций фиксированный, не растёт по ходу. Каждая анимация имеет non-motion fallback через `useReducedMotion()` хук.
   *Acceptance:* visual-regression Playwright snapshot не ломается; reduced-motion test (Phase 4 шаг 1) зелёный.

7. **Real product screenshots pipeline.**
   `e2e/screenshots/` — отдельный Playwright project (не часть `pnpm test:e2e`) с командой `pnpm screenshots`. Берёт seeded test-account, снимает: hero composition (board + critical moment + AI coach card overlay), `/review/[gameId]` mobile + desktop, `/dashboard` mobile + desktop, `/daily-blunder`. Сохраняет в `public/screenshots/` (committed, чтобы CI не нужен Supabase для рендера landing).
   *Acceptance:* `pnpm screenshots` создаёт 8 PNG-файлов; landing их использует через `next/image`.

8. **Final landing page `app/[locale]/(marketing)/page.tsx`.**
   Глубокая спека в §7. Section composition: Hero → Problem → How it works → Game Review preview → Pattern taxonomy → Dashboard preview → Daily Blunder teaser → Pricing teaser → Demo video → Final CTA. Mobile-first vertical, desktop переходит в multi-column для секций с product preview.
   *Acceptance:* Lighthouse mobile ≥ 90 perf / 100 a11y; landing рендерится за < 1s SSR; нет hydration warnings.

9. **Demo video через Remotion.**
   Глубокая спека в §8. Storyboard по PRD §8.6 / Design Doc §22. Voice-over (EN) генерируется через ElevenLabs или native (iPhone Memos), субтитры дублируются EN/RU. Render: `npx remotion render src/Demo.tsx out/demo.mp4 --codec=h264 --quality=80`.
   *Acceptance:* видео ≤ 75s, ≤ 8MB, эмбедится в landing через `<video controls preload="none" poster=...>`.

10. **README mini-pitch.**
    Глубокая спека в §9. Шаблон по PRD §16.1.
    *Acceptance:* GitHub repo preview показывает hero screenshot и demo GIF; README < 800 lines; все ссылки рабочие.

11. **Submission материалы.**
    - `docs/submission.md` — one-pager: продукт + проблема + решение + ключевые цифры + ссылки (live URL, GitHub, video, decisions.md).
    - `docs/demo-script.md` — 2–3 минуты walkthrough для комиссии: что говорить, что показывать на экране, какой sample game использовать.
    - В README — секция "For nFactorial committee" со ссылками на оба документа.
    *Acceptance:* совпадает по facts с decisions.md; demo script проходит timer-check < 3 минут вслух.

12. **Performance + a11y final pass.**
    - `app/opengraph-image.tsx`, `app/twitter-image.tsx` через Next.js Image generation (1200×630, hero composition).
    - `app/sitemap.ts` — все public routes per locale.
    - `app/robots.ts` — allow all, sitemap link.
    - Preload Geist Sans 500/600 в `app/layout.tsx`.
    - Lighthouse audit на 4 ключевых экранах (mobile + desktop).
    - Keyboard navigation на review-экране (Tab по карточкам, Enter активирует best move toggle).
    - Screen-reader: `aria-label` на board squares, `aria-live="polite"` на critical moment counter.
    *Acceptance:* Lighthouse mobile перформ ≥ 90 на `/`, `/play`, `/review/[gameId]`, `/dashboard`. A11y ≥ 95 везде.

13. **Аналитика.**
    Vercel Analytics (минимум) — добавить `<Analytics />` в `app/[locale]/layout.tsx`, env-var `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` через Vercel UI. Если успеваем — PostHog с custom events: `landing_cta_click`, `first_game_started`, `first_review_completed`, `daily_blunder_solved`, `pro_waitlist_joined`. PostHog инициализируется в client-component, обёрнутом в `<Suspense>`.
    *Acceptance:* dashboard Vercel Analytics показывает page-views после deploy; если PostHog — events приходят в проект "blunderlab" с правильным `user_id`.

14. **Error / 404 pages per locale.**
    `app/[locale]/not-found.tsx` — soft 404 с CTA "Back to landing" + поиск. `app/[locale]/error.tsx` — error boundary с retry-button и e-mail support placeholder. Tone-of-voice совпадает с landing.
    *Acceptance:* hit `/en/random-route` → красивая 404; force throw в page → error boundary показывается без stack trace.

15. **Final deploy + smoke test.**
    `vercel deploy --prod`. Smoke-чеклист (12 пунктов из §10) проходим вручную в production. Custom domain — отложено до подачи submission (можно подать `*.vercel.app` URL).
    *Acceptance:* live URL работает на mobile + desktop, EN + RU, демо-видео загружается, OG preview корректно показывается на Telegram/X.

---

## 5. i18n Migration Spec

### 5.1 Configuration

`next-intl` v4.11+ уже в `package.json`. Конфиг:

`i18n/routing.ts`:
```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed", // / → /, /play → /play, /ru/play → ru
});
```

`proxy.ts` (existing — это Next.js 16 routing middleware, замена `middleware.ts`) расширяется:
```ts
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default function proxy(req: NextRequest) {
  // 1. existing auth-protect для /dashboard, /daily-blunder, etc.
  // 2. then intlMiddleware(req)
}
```

`i18n/request.ts`:
```ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? "en";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

`next.config.ts`:
```ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl(nextConfig);
```

### 5.2 Route migration

Текущая структура:
```
app/
├── (service)/
├── api/
├── auth/
├── onboarding/
├── play/
├── pro/
├── review/
└── sign-in/
```

Целевая:
```
app/
├── [locale]/
│   ├── (marketing)/
│   │   └── page.tsx              # landing (была app/page.tsx)
│   ├── (app)/
│   │   ├── play/
│   │   ├── review/[gameId]/
│   │   ├── dashboard/
│   │   ├── daily-blunder/
│   │   ├── leaderboard/
│   │   ├── pro/
│   │   └── settings/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── onboarding/
│   ├── not-found.tsx
│   ├── error.tsx
│   └── layout.tsx
├── api/                          # остаётся flat — не локализуется
├── auth/callback/                # остаётся flat — Supabase редиректит сюда без префикса
├── opengraph-image.tsx
├── twitter-image.tsx
├── sitemap.ts
├── robots.ts
└── globals.css
```

`app/auth/callback/route.ts` остаётся **без** `[locale]` префикса — Supabase OAuth redirect URL фиксирован в проектных настройках. После `exchangeCodeForSession` callback читает `Accept-Language` или cookie `NEXT_LOCALE`, redirect на `/[locale]/dashboard` или `/[locale]/onboarding`.

### 5.3 Bulk replacement

Все `<Link href="/play">` → `<Link href="/play">` через `Link` из `next-intl` (не `next/link`):
```ts
import { Link } from "@/i18n/navigation";
// автоматически добавляет /[locale]/ префикс если нужен
```

`navigation.ts`:
```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

Все `redirect("/dashboard")` в server actions → `redirect("/dashboard")` из `@/i18n/navigation`.

### 5.4 Locale switcher

`components/common/locale-switcher.tsx` — `<DropdownMenu>` с EN / RU, использует `useRouter().replace(pathname, { locale })`. Размещается в:
- App shell sidebar footer (`components/app/sidebar.tsx`)
- Landing nav (`components/landing/nav.tsx`)

### 5.5 Hreflang & SEO

`app/[locale]/layout.tsx` рендерит:
```tsx
<link rel="alternate" hrefLang="en" href={`${baseUrl}/${pathname}`} />
<link rel="alternate" hrefLang="ru" href={`${baseUrl}/ru/${pathname}`} />
<link rel="alternate" hrefLang="x-default" href={`${baseUrl}${pathname}`} />
```

### 5.6 Edge cases

- **Пользователь приходит на `/play` (без локали).** Middleware определяет default `en`, рендерит без префикса. Cookie `NEXT_LOCALE=en` не ставится (default).
- **Пользователь меняет локаль на RU через switcher.** Cookie `NEXT_LOCALE=ru` устанавливается, redirect на `/ru/play`. Все последующие запросы остаются на RU.
- **Supabase callback redirect.** `app/auth/callback/route.ts` после exchange читает `?next=` (предполагаемо `/dashboard` без префикса) и cookie `NEXT_LOCALE`. Если cookie `ru` — redirect на `/ru/dashboard`, иначе `/dashboard`.
- **`/sign-in?next=/dashboard` при middleware-redirect.** Auth-protect логика в `proxy.ts` сохраняет `next` query без локали; sign-in page добавляет локаль обратно после успешного login.

---

## 6. Motion Polish Spec

### 6.1 Целевые анимации (фиксированный список)

| # | Где | Что | Длительность | Easing |
|---|-----|-----|--------------|--------|
| 1 | Landing hero | stagger-reveal headline + sub + CTA + product card | 600ms | out-expo |
| 2 | Landing how-it-works | step-reveal по scroll (IntersectionObserver) | 400ms | out-expo |
| 3 | Review screen | critical-moment carousel slide + fade | 240ms | out-expo |
| 4 | Review AI Coach | typing-style reveal текста (per-char или per-word) | 1.2s total | linear |
| 5 | Review board | best-move arrow draw-in (SVG `pathLength`) | 600ms | out-expo |
| 6 | Dashboard | counter animations через `useMotionValue` | 800ms | out-quad |
| 7 | Daily Blunder | answer reveal flip-card | 400ms | out-expo |
| 8 | Pro page | card hover lift `translateY(-4px) + shadow` | 200ms | out-expo |
| 9 | Page transitions | fade-in на route change | 150ms | linear |
| 10 | Skeleton loaders | shimmer для review pipeline loading | infinite | linear |

### 6.2 Reduced-motion fallback

Каждая анимация обёрнута:
```tsx
const reduceMotion = useReducedMotion();
const transition = reduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] };
```

Глобальный CSS в `app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 6.3 Bundle impact

Framer Motion v11 — ~30KB gzipped. Импортируем через `framer-motion/m` (lazy motion API) и оборачиваем в `<LazyMotion features={domAnimation}>` в `(marketing)` и `(app)` layouts, чтобы не платить bundle на routes без motion (api/auth/callback).

---

## 7. Final Landing Page Spec

### 7.1 Sections (mobile vertical → desktop multi-column)

1. **Hero** — `app/[locale]/(marketing)/_sections/hero.tsx`
   - Headline: `Turn every blunder into your next training plan.` (EN) / `Преврати каждую ошибку в персональный план тренировок.` (RU)
   - Subhead: PRD §10.2 текст
   - Primary CTA: "Start training" → `/play` (если без auth — anon flow Phase 2)
   - Secondary CTA: "Watch demo" → smooth-scroll к demo video секции
   - Hero visual: composition card (board snapshot + AI coach overlay + small dashboard widget)
   - На desktop — два column: text left, composition right
   - Mobile — vertical stack, composition стоит выше CTA

2. **Problem** — короткий блок с цитатой пользователя (PRD §2.2):
   > "Я проиграл, но не понял, чему именно должен научиться."
   - Контраст: что показывает обычный engine vs что показывает BlunderLab

3. **How it works** — 4-шаг flow `Play → Review → Pattern → Train` с иконками + step-reveal на scroll

4. **Game Review preview** — реальный screenshot critical moment card с подписями (callout-стрелки указывают на pattern badge, best move arrow, training goal)

5. **Pattern taxonomy** — grid 8 категорий из decisions.md §8 с одной-строчным описанием каждой. На hover — подсветка примера

6. **Dashboard preview** — screenshot dashboard mobile + desktop side-by-side, callout: "Track top weakness, streak, daily blunder, city rank"

7. **Daily Blunder teaser** — copy: "Yesterday you missed this fork. Can you find it today?"

8. **Pricing teaser** — три tier-карточки (Free / Pro / School) compact, CTA "See full comparison" → `/pro`

9. **Demo video** — `<video>` 720p H.264 с poster=hero-composition.png, autoplay=false, muted=false, controls

10. **Final CTA** — full-width section "Start your first review" + button → `/play`

11. **Footer** — © 2026 BlunderLab · GitHub · Twitter · decisions.md (для прозрачности перед комиссией) · Privacy · Terms (placeholder)

### 7.2 Visual rules

Палитра — locked Graphite из decisions.md §5. Тема — dark default (можно light toggle позже).
Fonts — Geist Sans/Mono.
Hero composition использует `next/image` с `priority` + `placeholder="blur"` для LCP.
Анимации — только #1 и #2 из §6.1 (hero stagger + how-it-works step-reveal).

### 7.3 Performance targets

- LCP < 2.0s mobile (hero image preloaded, font preloaded)
- CLS < 0.05 (все images с фиксированными `width`/`height`)
- JS bundle landing < 150KB gzipped (без app shell)
- Hero composition image — AVIF + WebP fallback, < 80KB

---

## 8. Demo Video Spec

### 8.1 Tool decision

**Remotion** — выбран за scripted React-based control, reproducibility и возможность регенерировать видео при изменении UI. HyperFrame использовался бы для screen-record polished session, но даёт меньше контроля.

Установка локально (не в production deps):
```sh
pnpm add -D remotion @remotion/cli @remotion/player
```

Корневой проект Remotion живёт в `remotion/` — отдельная директория, не часть Next.js.

### 8.2 Storyboard (45–75s)

По PRD §8.6 / Design Doc §22:

| t | Scene | Длительность | Voice-over (EN) | Subtitle RU |
|---|-------|--------------|-----------------|-------------|
| 0:00 | Logo + tagline | 3s | "BlunderLab. Don't just see your blunders. Understand them." | "Не просто увидеть. Понять." |
| 0:03 | Player makes a move | 5s | "You play a game against our AI." | "Ты играешь против нашего AI." |
| 0:08 | Critical mistake highlights | 4s | "We detect the moment your game changed." | "Мы находим момент, где партия изменилась." |
| 0:12 | Review opens | 3s | "And we explain — in plain language —" | "И объясняем — простым языком —" |
| 0:15 | AI Coach card reveal | 5s | "what pattern of thinking caused the mistake." | "какой паттерн мышления привёл к ошибке." |
| 0:20 | Blunder Pattern badge | 4s | "Tunnel Vision. King Safety. Hanging Piece. Eight categories." | "8 категорий: Tunnel Vision, King Safety и другие." |
| 0:24 | Training Goal card | 5s | "You walk away with one clear goal for your next game." | "Ты уходишь с одной чёткой целью на следующую партию." |
| 0:29 | Dashboard | 6s | "Your dashboard tracks weaknesses, streaks, and city rank." | "Дашборд отслеживает слабости, стрик и место в городе." |
| 0:35 | Daily Blunder | 5s | "Each day, a personal puzzle from your own past mistakes." | "Каждый день — задача из твоей прошлой партии." |
| 0:40 | Pro upsell flash | 3s | "Pro unlocks unlimited reviews and weekly training plans." | "Pro — безлимит ревью и недельный план." |
| 0:43 | Final tagline + CTA | 5s | "BlunderLab. Your AI chess coach after every game." | "Твой AI-тренер после каждой партии." |
| 0:48 | Logo + URL | 2s | (silence) | (URL) |

Total: ~50s.

### 8.3 Implementation

`remotion/src/Demo.tsx` — Composition с `useCurrentFrame()`, использует те же `next/image` screenshots что и landing (через `staticFile` API). Voice-over записан отдельно (или ElevenLabs `eleven_turbo_v2`), импортируется как `<Audio src={...}/>`.

Subtitles — `<AbsoluteFill>` с `<p>` overlay, switch по locale через `defaultProps.locale`.

Render command:
```sh
pnpm exec remotion render Demo out/demo-en.mp4 --props='{"locale":"en"}' --codec=h264 --quality=80
pnpm exec remotion render Demo out/demo-ru.mp4 --props='{"locale":"ru"}' --codec=h264 --quality=80
```

### 8.4 Hosting

Видео заливается в `public/demo-en.mp4` и `public/demo-ru.mp4` (≤ 8MB каждое). Если размер выходит больше — переносим в Vercel Blob Storage и embed через подписанный URL.

Embed:
```tsx
<video
  controls
  preload="none"
  poster="/screenshots/hero-composition.png"
  className="aspect-video w-full"
>
  <source src={locale === "ru" ? "/demo-ru.mp4" : "/demo-en.mp4"} type="video/mp4" />
  <track kind="captions" srcLang={locale} src={`/captions/${locale}.vtt`} default />
</video>
```

### 8.5 Submission GIF

Для README — конвертируем первые 8s в GIF через ffmpeg:
```sh
ffmpeg -i public/demo-en.mp4 -t 8 -vf "fps=12,scale=720:-1:flags=lanczos" -loop 0 public/demo-preview.gif
```

GIF ≤ 5MB, fits в GitHub README image preview.

---

## 9. README Spec

### 9.1 Структура (PRD §16.1)

```markdown
# BlunderLab

> AI chess coach that turns your blunders into a personalized training plan.

[![Demo](public/demo-preview.gif)](https://blunderlab.vercel.app)

[Live demo](https://blunderlab.vercel.app) · [Demo video](https://blunderlab.vercel.app#demo) · [Decisions log](docs/decisions.md) · [PRD](docs/PRD.md)

## The problem

Most chess platforms tell you *what move was wrong*. They don't help you understand *why you keep repeating the mistake*.

## What BlunderLab does

After every game, BlunderLab:
1. Detects 3 critical moments via Stockfish.
2. Classifies each into one of 8 thinking patterns (Tunnel Vision, King Safety, Hanging Piece, …).
3. Explains the mistake in plain language via an AI coach.
4. Gives you one concrete goal for your next game.

## Why this is different

[hero screenshot]

I intentionally did not try to clone Chess.com or Lichess. The product gap is between engine analysis and learning loop — that's where BlunderLab sits.

## Key features

- Play vs Stockfish (3 levels) with mobile-first board
- Post-game Review with AI Coach explanations
- 8-pattern blunder taxonomy
- Daily Blunder from your own past mistakes
- City Leaderboard ranked by improvement, not absolute strength
- Free tier with 3 reviews/day, Pro waitlist for unlimited

[review screenshot] [dashboard screenshot]

## Tech stack

Next.js 16 · TypeScript strict · Tailwind v4 · shadcn/ui · Supabase (Postgres + Auth + RLS) · chess.js · stockfish.wasm · OpenAI gpt-4o-mini · Remotion · Vercel · next-intl · Framer Motion

## Run locally

[setup steps from current README]

## Project status

- Phase 1 ✅ Playable foundation
- Phase 2 ✅ Review core
- Phase 3 ✅ Service layer
- Phase 4 ✅ Polish + demo (you're here)

Roadmap: KZ locale, multiplayer-by-link, weekly reports, training modes, shareable review cards, school dashboard.

## For nFactorial committee

- [Submission one-pager](docs/submission.md)
- [Demo script (3 minutes)](docs/demo-script.md)
- [Decisions log (source of truth)](docs/decisions.md)

## License

MIT
```

### 9.2 Acceptance

GitHub repo preview (open-graph) показывает hero screenshot. Demo GIF играет в README. Все ссылки кликабельны, ведут на live URL или relative-paths внутри репо.

---

## 10. Acceptance Criteria

Phase 4 done, когда:

1. Live URL `https://blunderlab.vercel.app` (или custom domain) открывается на mobile + desktop, EN и RU локали работают, locale switcher переключает все экраны без потери state.
2. Landing загружается за < 1.5s LCP на mobile 4G (Lighthouse). Hero composition + demo video poster видны above-the-fold.
3. Demo video 45–75s играется на landing и в README. Субтитры EN+RU переключаются по локали страницы.
4. README рендерится как product mini-pitch (не setup-инструкция). Hero screenshot + demo GIF видны на GitHub preview.
5. AI Coach explanation на RU грамотный, без machine-translation артефактов. Tone consistent — "precise, supportive, never humiliating".
6. Все carry-over тесты Phase 2/3 зелёные: Playwright Play → Review happy path, mobile snapshot review/dashboard, reduced-motion verification.
7. Lighthouse mobile perf ≥ 90 на `/`, `/play`, `/review/[gameId]`, `/dashboard`. A11y ≥ 95 везде.
8. Motion polish: 10 целевых анимаций (§6.1) реализованы и respect `prefers-reduced-motion`.
9. OG preview (Telegram, X, LinkedIn) показывает hero composition + headline + tagline.
10. `docs/submission.md` и `docs/demo-script.md` написаны, demo script проходит timer-check < 3 минут.
11. AI Coach persona locked в `decisions.md §12` (имя + tone + аватар).
12. Аналитика подключена (Vercel Analytics минимум; PostHog optional). После live deploy — page-views и hero CTA click видны в dashboard.
13. Error / 404 pages кастомные, с product tone, рендерятся в EN и RU.
14. Bundle: landing JS < 150KB gzipped, app routes < 300KB. Build time < 60s.
15. `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build` — все зелёные.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| `[locale]` migration ломает auth callback URL, который захардкожен в Supabase project | Auth callback остаётся **flat** (`/auth/callback`), читает `NEXT_LOCALE` cookie и редиректит на `/[locale]/...` после `exchangeCodeForSession`. Тест — Playwright `auth-upgrade.spec.ts`. |
| RU перевод выглядит как machine-translate | Перевод проходит ручную редактуру носителем (сам автор + один внешний reader). Никакой автоматизации в этом шаге. |
| Demo video запиливается дольше, чем ожидается, и блокирует landing | Параллелим: Storyboard и Remotion-проект делаются одновременно с landing. Если за 2 дня не сходится — fallback на screen-record через QuickTime + ручной cut в iMovie/CapCut. |
| Real product screenshots требуют seeded Supabase, и snapshot pipeline хрупкий | `e2e/screenshots/` использует test-account с deterministic FEN-партией (хардкодим PGN). Coach output берём из cache (mock), чтобы snapshots были стабильны. |
| Lighthouse perf падает из-за Framer Motion + Remotion video | Framer через `LazyMotion` (lazy import). Demo video с `preload="none"` и poster image. Video не загружается до клика. |
| OpenAI quota exceeds на demo deploy | `REVIEW_DAILY_LIMIT=3` остаётся. Для demo-юзера в Supabase — отдельный flag `is_demo_account` с лимитом 30. Manual seed одного demo-аккаунта в `supabase/seed/demo.sql`. |
| KZ-аудитория ожидает KZ локаль на demo | В `docs/submission.md` явно пишем "RU + EN at submission, KZ on roadmap". В Pro page — упоминание "More languages coming soon". |
| Hreflang настроен неправильно → дубли в Google Search Console | Не критично для submission (демо только что задеплоен). После — добавить `noindex` для `/ru/*` если RU контент машинный. Поскольку перевод ручной, оставляем `index, follow`. |
| Анимации создают motion sickness у части аудитории | `prefers-reduced-motion` респектится глобально (CSS) + per-component (Framer `useReducedMotion`). Snapshot test это проверяет. |
| Demo video размер > 8MB → медленно на mobile | Если `out/demo.mp4` > 8MB после compression — переносим в Vercel Blob, эмбедим через signed URL. Альтернатива — два качества: 480p preview + 720p full. |
| Submission deadline и "ещё одна фича" соблазн | §13 явный stop-rule: после §10 acceptance — никаких новых фич. Только bug fixes. Multiplayer / weekly report / shareable cards — в roadmap. |
| `vercel.json` крон Phase 3 ломается при `[locale]` migration | Cron route `/api/cron/leaderboard-snapshot` остаётся flat (под `app/api/`, не `app/[locale]/api/`). Это уже так. Регрессия test — manual `curl` после deploy. |

---

## 12. Phase 4 → Post-submission handoff

Если submission принят и есть бюджет на следующую итерацию — приоритеты в порядке value/effort:

1. **Training modes** — Pattern Drill, Deep Review, Goal Focus, Builder Sprint. Pro-value строится вокруг learning depth, не skins. ~3-5 дней.
2. **Multiplayer-by-link** (PRD §9.3 could-have). Live socket через Supabase Realtime или Liveblocks. Партии тоже сохраняются в `games`, review pipeline переиспользуется. ~2 недели.
3. **Weekly report email** через Supabase Edge Functions + Resend. Раз в неделю — top weakness, blunders reduced, city rank. Driver retention. ~1 неделя.
4. **Shareable review cards** — image generation через `@vercel/og` или Satori. URL-shareable: `https://blunderlab.app/share/[reviewId]`. ~1 неделя.
5. **KZ-локаль** — copy-paste RU → KZ через профессионального переводчика. AI Coach prompt получает `kk` locale. ~3 дня.
6. **Custom board skins** — cosmetic roadmap only, не главный Pro-value. Хранение в `profiles.preferences` если когда-нибудь понадобится. ~5 дней.
7. **School/team dashboard** — отдельная RLS-роль `coach`, видит ученические `game_reviews`. Big feature. ~3 недели.
8. **Stripe payments** — Pro waitlist становится реальным checkout. ~1 неделя на подключение + compliance.
9. **Account merge** для users с двумя anon-сессиями (Phase 3 unresolved risk). Migration script + UI confirmation. ~3 дня.

---

## 13. Planning Rule

Phase 4 не открывает продуктовых поверхностей сверх зафиксированных в §3 «In scope». Если по ходу работы возникнет соблазн добавить multiplayer, weekly report, shareable cards, KZ-локаль — это пишется как тикет в roadmap (§12) и **не делается** в этой фазе.

UI-блоки для landing и motion строятся поверх существующих shadcn-style примитивов (`Card`, `Button`, `Badge`) и Framer Motion. Новые primitives добавляем только если конкретный экран не складывается из имеющегося набора — по принципу «extract when needed, not before».

Submission-материалы (`docs/submission.md`, `docs/demo-script.md`) — последний шаг. Они пишутся **после** того, как все остальные acceptance criteria из §10 выполнены, чтобы факты в them совпадали с реальным состоянием продукта.

После прохождения acceptance criteria §10 и live deploy — Phase 4 закрыт. Дальнейшая работа идёт через post-submission roadmap (§12) или новый phase plan.
