# BlunderLab — Deployment Notes

Дата фиксации: 2026-05-01
Покрытие: Phase 2 prototype, развёрнутый через Supabase MCP + Vercel CLI 52.0.0.

> Что MCP сделал автоматически и что осталось сделать руками — оба списка ниже.

---

## 1. Supabase

### Что развёрнуто

| Поле | Значение |
| --- | --- |
| Project ID | `tsijruonmfrwydtdmpdx` |
| Project name | `blunderlab` |
| Org | `sabr2007's Org` (`trpiwdnqeqzqqdtpqmxf`) |
| Region | `eu-central-1` (Frankfurt) |
| Postgres | 17.6.1.105 |
| URL | `https://tsijruonmfrwydtdmpdx.supabase.co` |
| Anon key (legacy JWT) | `sb_publishable_F6Esp9PX4ASHD10tDE4P4A_jIg5Pvbx` или legacy JWT (см. `.env.local`) |
| Migrations applied | `20260501183000_phase1_core_schema`, `20260501185500_phase1_advisor_hardening` |

### Что MCP **не** делает — обязательные ручные шаги

1. **Включить Anonymous provider.** Без этого `auth.signInAnonymously()` отвечает 422 и persistence в Phase 2 не работает (game не сохраняется → review недоступен).

   Dashboard → Authentication → Providers → **Anonymous Sign-Ins** → toggle ON.

   Альтернатива в SQL:
   ```sql
   update auth.config set value = 'true'::jsonb where parameter = 'enable_anonymous_signups';
   ```
   (но в managed Supabase правка `auth.config` не разрешена через SQL editor — только через UI).

2. **Создать Service Role key** (для server-only кода, например крон leaderboard в Phase 3). Уже существует автоматически: Dashboard → Project Settings → API → `service_role`. Скопируй в `.env.local` поле `SUPABASE_SERVICE_ROLE_KEY` если понадобится server-side admin доступ. Для Phase 2 текущий код этот ключ не использует.

3. **Phase 3 prep — Google OAuth provider.** Когда мы будем делать настоящий sign-in вместо anonymous:
   - Google Cloud Console → OAuth 2.0 Client IDs → Web application
   - Authorized redirect URI: `https://tsijruonmfrwydtdmpdx.supabase.co/auth/v1/callback`
   - Скопировать Client ID / Client Secret в Supabase Dashboard → Authentication → Providers → Google → ON.

### Advisors статус (после двух миграций)

- Security: **0 lints** ✅
- Performance: **0 WARN**, остаются `INFO`-level: unused indexes (нормально для пустой БД, оживут с трафиком) и порядок колонок в covering index `(game_id, user_id)` — игнорируется до первого замедления.

---

## 2. Vercel

### Что развёрнуто автоматически

| Поле | Значение |
| --- | --- |
| Project ID | `prj_PFp6L0Ogn5yrNSC8lg626woWNrxe` |
| Org ID | `team_bAaZxgne5RtuAuASS5SQRnWv` (sabr2007's personal scope) |
| Project name | `blunderlab` |
| First deploy URL | `https://blunderlab-445p28dmb-sabr2007s-projects.vercel.app` |
| Build time | ~37s (Turbopack) |
| Routes | `/` (static), `/play` (static), `/review/[gameId]` (dynamic SSR), `/_not-found` |

Env переменные через CLI (`vercel env add`) залиты в:
- ✅ Production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `COACH_TIMEOUT_MS`, `REVIEW_DAILY_LIMIT`
- ✅ Development: то же самое **без** `OPENAI_API_KEY` (на локальной машине берётся из `.env.local`)
- ❌ Preview: пусто — см. известную проблему ниже

### Известная проблема: Preview env-vars через CLI

Vercel CLI (тестировал и v52.0.0, и v53.0.1) для preview-окружения возвращает `git_branch_required` даже при явном `--yes` флаге:

```
$ vercel env add NEXT_PUBLIC_SUPABASE_URL preview --value "$VAL" --yes
{
  "status": "action_required",
  "reason": "git_branch_required",
  ...
}
```

Это не блокер для текущего сетапа: проект пока без git-integration с Vercel, preview-деплои не создаются автоматически. Если позже подключим git → нужно либо:

1. Добавить через dashboard: Project → Settings → Environment Variables → New → выбрать **Preview** → All branches.
2. Или передать конкретную ветку: `vercel env add NEXT_PUBLIC_SUPABASE_URL preview main --value "$VAL" --yes`.

### Что MCP **не** делает — обязательные ручные шаги

1. **`SUPABASE_SERVICE_ROLE_KEY`** не залит ни в одно окружение — Phase 2 его не использует. Если в Phase 3 появится server-only admin доступ (для крон leaderboard или migration anon→Google), нужно добавить:
   - Supabase Dashboard → Settings → API → скопировать `service_role`
   - `vercel env add SUPABASE_SERVICE_ROLE_KEY production` через CLI или dashboard

2. **Добавить production redirect URLs в Supabase Auth.** После того как у Vercel появится production URL (`*.vercel.app` или custom domain):

   Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `https://<your-vercel-domain>`
   - Redirect URLs: добавить `https://<your-vercel-domain>/auth/callback`

   Phase 2 этим не пользуется (anonymous auth не использует redirects), но без этого Phase 3 Google flow работать не будет.

3. **Обновить Vercel CLI** (nice-to-have): `pnpm add -g vercel@latest` — текущая локальная 52.0.0, актуальная 53.0.1.

---

## 3. OpenAI

### Что нужно сделать вручную **прямо сейчас**

1. **Ротировать ключ.** Тот ключ был передан в plain-text через чат-сессию, что попадает в логи и снапшоты этого разговора. Нужно:
   - OpenAI Dashboard → API keys
   - Найти `sk-proj-0QpHY...` → **Revoke**
   - Generate new secret key → скопировать в:
     - `.env.local` локально
     - Vercel `OPENAI_API_KEY` env var (Edit → New Value)
     - Trigger redeploy так, чтобы новый ключ подхватился

2. **Поставить usage limit** на проект в OpenAI Dashboard → Settings → Limits. Hard limit ~$5/month для прототипа достаточно (~25k coach-вызовов на gpt-4o-mini).

---

## 4. Google OAuth для лендинга (Phase 3)

Это фича Phase 3, не Phase 2. Краткий чеклист, чтобы при подходе к ней не терять время:

1. Google Cloud → Create Project (или существующий)
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID → Web application
3. Authorized JavaScript origins: production domain
4. Authorized redirect URIs: `https://tsijruonmfrwydtdmpdx.supabase.co/auth/v1/callback`
5. Client ID + Client Secret → Supabase Dashboard → Authentication → Providers → Google
6. В коде:
   - Кнопка "Continue with Google" на лендинге (`app/page.tsx`) и в `/sign-in`
   - `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '<origin>/auth/callback' } })`
   - Route handler `app/auth/callback/route.ts` — обмен code на session
   - **Migration anonymous → Google**: в callback вызвать `supabase.auth.linkIdentity({ provider: 'google' })` если уже есть anon-сессия — это сохранит все данные Phase 2 партий за тем же `auth.users.id`.

Эту фичу планируем в Phase 3 plan, который пишется после стабилизации Phase 2 e2e.

---

## 5. Smoke-тест чек-лист после ручных шагов

Когда выполнишь `(1)` Anonymous toggle и `(2)` Vercel env-vars + redeploy:

1. Открой preview URL → `/play`
2. DevTools Network → должен пройти запрос на `auth/v1/signup` со статусом 200 (anonymous sign-in)
3. Сделай 3-4 хода → нажми Resign → `Review my mistakes` должен стать активным
4. Перейди на `/review/<gameId>` → видишь прогресс-бар Stockfish, потом 0–3 critical moments + AI Coach explanations
5. Перезагрузи страницу review → cache hit, OpenAI не дёргается (проверь по `review_model = 'gpt-4o-mini'` в `game_reviews` через Supabase Table Editor)
6. Сделай 4-й review подряд → должен показаться `Daily review limit reached` баннер

Если что-то ломается — открой Vercel runtime logs (`vercel logs <deployment-url>`) или Supabase Dashboard → Logs → Postgres / API.
