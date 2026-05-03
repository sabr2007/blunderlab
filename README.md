# BlunderLab
![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript strict](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2F%20Postgres%20%2F%20RLS-3ECF8E?style=flat&logo=supabase&logoColor=white)
![next-intl](https://img.shields.io/badge/next--intl-EN%20%2F%20RU-111827?style=flat)
![Stockfish WASM](https://img.shields.io/badge/Stockfish-WASM-0F766E?style=flat)
![Vitest](https://img.shields.io/badge/Vitest-Unit%20Tests-6E9F18?style=flat&logo=vitest&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?style=flat&logo=openai&logoColor=white)

> AI-шахматный коуч, который превращает blunder'ы в персональный план тренировки.

[Живая демо-версия](https://blunderlab.vercel.app) · [Слот под демо-видео](https://blunderlab.vercel.app/en#demo) · [Краткое описание](docs/submission.md) · [Сценарий демо](docs/demo-script.md) · [PRD](docs/PRD.md) · [CJM](docs/CJM.md) · [Журнал решений](docs/decisions.md) · [Финальный scope](docs/plans/submission-final-scope.md)

## Коротко

BlunderLab — это AI-шахматный коуч для начинающих и intermediate-игроков. Он не ограничивается фразой “best move” и не превращает анализ в сухую таблицу движка. Продукт показывает, почему ошибка произошла, какой паттерн за ней стоит и что именно стоит тренировать дальше.

Главная петля продукта проста и понятна комиссии:

**Play → Review → Pattern → Train → Improve → Return**

<img width="1439" height="781" alt="image" src="https://github.com/user-attachments/assets/f60b153c-a4d5-4510-bf1d-211007f09f42" />

## Почему это важно

Большинство шахматных платформ хорошо отвечают на вопрос “какой ход был неправильным?”. BlunderLab отвечает на более полезный вопрос: “какую привычку мышления нужно изменить, чтобы эта ошибка не повторялась?”.

Это особенно важно для новичков и тех, кто хочет улучшаться без живого тренера. Вместо абстрактного engine analysis пользователь получает понятный разбор, обучение от своих ошибок и один конкретный следующий шаг.

## Что делает BlunderLab

1. Позволяет играть против Stockfish прямо в браузере.
2. Находит критические моменты, где оценка партии изменилась сильнее всего.
3. Классифицирует ошибку в одну из 8 blunder-паттернов.
4. Объясняет ошибку через BlunderLab Coach на EN или RU.
5. Превращает прошлые ошибки в Daily Blunder, dashboard-метрики и повторяемые тренировки.

## Чем BlunderLab отличается

BlunderLab сознательно не пытается быть ещё одним Chess.com или Lichess. Это не клон большой шахматной платформы, а узкий learning loop после партии.

- Chess.com и Lichess сильны в игре, рейтинге и широкой экосистеме.
- BlunderLab сильнее там, где игроку нужно понять собственный паттерн ошибки.
- Вместо “вот движок” продукт говорит: “вот почему ты снова попал в ту же ловушку”.

## Что входит в текущий submission

Документация и final scope зафиксированы отдельно, а README собирает их в одну понятную историю.

- Training Goal Continuity: цель из Review показывается в следующей партии на Play.
- Weekly Weakness + identity label: дэшборд показывает, над чем пользователь реально улучшился на этой неделе.
- Training Modes как Pro value: Pro продаёт глубину тренировок, а не косметические скины.
- Chess for Builders: отдельный landing-угол для студентов, разработчиков и builder-аудитории nFactorial.
- Pro page alignment: честная бизнес-страница без live Stripe checkout, но с понятной ценностью.

## Как работает продукт

1. Пользователь начинает партию против AI.
2. После партии система запускает review pipeline.
3. Stockfish остаётся источником истины для ходов и оценки позиции.
4. OpenAI `gpt-4o-mini` используется только для объяснения и формулировки training hint.
5. Если модель недоступна, включается детерминированный fallback template.
6. Результат попадает в dashboard, Daily Blunder и следующий training goal.

## Технический стек

- Next.js 16 App Router
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Supabase Auth / Postgres / RLS
- `chess.js`
- `react-chessboard`
- Stockfish WASM
- `next-intl` для EN/RU роутинга
- OpenAI `gpt-4o-mini` с fallback-шаблонами
- Framer Motion для акцентных анимаций
- Vercel Analytics
- Vitest и Playwright
- Biome для lint/format

## Локальный запуск

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Откройте `http://localhost:3000/en`.

## Скрипты

| Команда | Что делает |
| --- | --- |
| `pnpm dev` | Запускает Next.js в режиме разработки |
| `pnpm build` | Собирает production build |
| `pnpm start` | Запускает production-сервер |
| `pnpm typecheck` | Проверяет TypeScript без emit |
| `pnpm lint` | Запускает Biome check |
| `pnpm format` | Форматирует проект Biome |
| `pnpm test` | Запускает Vitest |
| `pnpm test:e2e` | Запускает Playwright E2E |
| `pnpm db:types` | Перегенерирует Supabase TypeScript types |

## Материалы для комиссии

- [Submission one-pager](docs/submission.md)
- [PRD](docs/PRD.md)
- [Customer Journey Map](docs/CJM.md)
- [Design document](docs/design-document.md)

## Статус проекта

- Фаза 1: рабочая основа для игры.
- Фаза 2: ядро review.
- Фаза 3: сервисный слой.
- Фаза 4: i18n, финальный лендинг, submission-документы, SEO/social preview, analytics и error pages.
- Фаза 5: фиксированный final scope для submission sprint.

## Roadmap
Еженедельные отчёты на почту, shareable review cards, fully generated pattern drills, real checkout и dashboard для школы или команды.
