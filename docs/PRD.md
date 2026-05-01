# BlunderLab — Product Requirements Document

Дата: Май 2026
Статус: Strategic PRD v1.1 — application prototype
Автор: Sabyrzhan, кандидат nFactorial Incubator 2026
Формат: веб-приложение
Рабочий стек: Next.js 16 (App Router) / TypeScript / Tailwind v4 / shadcn/ui / Supabase / chess.js / stockfish.wasm / OpenAI gpt-4o-mini

> **Все технические и продуктовые решения зафиксированы в [decisions.md](./decisions.md).** При расхождении с этим PRD — побеждает decisions.md. Этот документ описывает «зачем», decisions.md — «как именно».

---

## 0. Контекст задачи

BlunderLab создаётся как продуктовый прототип для второго этапа отбора в nFactorial Incubator. Формально задача звучит как “создать современную веб-платформу для игры в шахматы”, но фактическая цель шире: показать, что кандидат способен не просто собрать шахматную доску, а спроектировать продукт, который потенциально может стать настоящим сервисом.

Поэтому BlunderLab сознательно не пытается повторить Chess.com или Lichess. Такой подход был бы слабым: рынок уже заполнен сильными платформами для игры, анализа и обучения. Вместо этого продукт фокусируется на более узкой и конкретной проблеме:

> Игроки часто знают, что сделали плохой ход, но не понимают, какую привычку или паттерн мышления им нужно изменить.

BlunderLab строится вокруг этой боли. Это не просто шахматная платформа, а AI-тренер, который превращает каждую партию в понятный план улучшения.

---

## 1. Executive Summary

**BlunderLab** — AI-powered chess training platform, которая помогает начинающим и intermediate-игрокам не просто играть в шахматы, а понимать свои ошибки и превращать их в персональный тренировочный план.

Пользователь играет партию против AI или другого игрока, после чего получает короткий разбор:

* где партия реально изменилась;
* какие 2–3 ошибки были критичными;
* какой был лучший ход;
* почему ошибка произошла человеческим языком;
* какой повторяющийся паттерн проявился;
* что потренировать дальше.

Главная продуктовая петля:

> Play → Review → Understand → Train → Improve → Return

В отличие от классических шахматных сайтов, BlunderLab делает акцент не на количестве партий, а на качестве обратной связи после партии. Продукт помогает игроку увидеть не только “ход был плохим”, но и “я снова попал в один и тот же паттерн: не защищаю фигуры / игнорирую угрозу мата / играю слишком быстро / гонюсь за пешкой”.

**Ключевой инсайт:** существующие шахматные платформы уже хорошо решают задачу игры и анализа, но не всегда переводят engine analysis в понятный, персональный learning loop. BlunderLab занимает именно этот промежуток: между шахматным движком и живым тренером.

**Для кого:** motivated beginners, школьники и студенты, junior developers, участники IT-инкубаторов, люди, которые хотят тренировать стратегическое мышление, паттерн-распознавание и умение анализировать ошибки.

**Почему это подходит под nFactorial:** продукт демонстрирует не только способность кодить, но и product thinking: выбор ниши, анализ конкурентов, гипотезу монетизации, удержание, пользовательский сценарий, AI-layer и бизнес-логику.

---

## 2. Проблема

### 2.1 Поверхностная проблема

Новички и intermediate-игроки часто проигрывают партии и видят в анализе:

* blunder;
* mistake;
* missed win;
* best move;
* engine evaluation;
* line variation.

Но этого недостаточно. Движок может показать лучший ход, но не всегда объясняет, почему игрок не увидел этот ход и как не повторить ошибку.

### 2.2 Настоящая проблема

Настоящая боль пользователя не в том, что он не может сыграть партию онлайн. Эту проблему уже отлично решают Chess.com, Lichess и другие платформы.

Настоящая боль:

> “Я проиграл, но не понял, чему именно должен научиться.”

Игрок после партии часто остаётся с фрустрацией:

* “Я видел, что ход плохой, но не понял почему.”
* “Engine показывает линию, но я бы никогда сам её не нашёл.”
* “Я снова сделал blunder, но не понимаю, это тактика, эндшпиль, открытый король или просто невнимательность.”
* “Я решаю случайные puzzles, но они не связаны с моими реальными ошибками.”

### 2.3 Продуктовая формулировка проблемы

Большинство шахматных приложений строит опыт вокруг игры, рейтинга и анализа. Но у начинающих игроков слабое место находится между анализом и обучением:

1. Игрок сыграл партию.
2. Платформа показала ошибку.
3. Игрок посмотрел лучший ход.
4. Игрок не понял паттерн ошибки.
5. Игрок пошёл играть следующую партию и повторил то же самое.

BlunderLab должен разорвать этот цикл.

---

## 3. Анализ рынка и конкурентов

### 3.1 Chess.com

Chess.com — главный массовый шахматный продукт. Он силён в игровом UX, onboarding, ботах, рейтинге, визуальной подаче, lessons, puzzles и Game Review. В премиум-модели есть game review, coach explanations, insights, advanced stats.

**Что Chess.com делает хорошо:**

* превращает шахматы в понятный consumer-продукт;
* даёт быстрый Game Review;
* объясняет ошибки более дружелюбно, чем raw engine analysis;
* создаёт сильные retention loops через рейтинг, streaks, puzzles, bots и ежедневную активность.

**Где остаётся возможность:**

* глубокая персональная работа с повторяющимися ошибками всё ещё может ощущаться как премиум/overwhelming;
* новичку сложно понять, какая привычка стоит за ошибкой;
* платформа слишком широкая: игра, новости, уроки, турниры, боты, puzzles, комьюнити. BlunderLab может быть уже и яснее.

### 3.2 Lichess

Lichess — бесплатная, open-source платформа с мощным анализом, Stockfish, studies, opening explorer, puzzles, variants, tournaments и community-функциями.

**Что Lichess делает хорошо:**

* бесплатно даёт очень мощные инструменты;
* подходит для самостоятельного анализа;
* имеет сильную шахматную культуру и доверие;
* не давит монетизацией.

**Где остаётся возможность:**

* raw analysis может быть сложным для новичка;
* объяснение требует шахматной грамотности;
* пользователь видит сильный инструмент, но не всегда получает простую человеческую рекомендацию “что делать завтра”.

### 3.3 Aimchess

Aimchess ближе всего к идее BlunderLab: персональная аналитика, отчёты, training plans, упражнения на основе собственных партий.

**Что Aimchess делает хорошо:**

* анализирует игры пользователя;
* определяет слабые места;
* предлагает персонализированные тренировки;
* связывает обучение с реальными партиями.

**Где остаётся возможность:**

* продукт может ощущаться как отдельная аналитическая надстройка, а не как простой игровой опыт;
* для прототипа nFactorial можно сделать более лёгкую, эмоциональную, визуальную и понятную версию;
* BlunderLab может позиционироваться не только как chess improvement tool, но как decision-making gym for builders.

### 3.4 Duolingo Chess / gamified learning

Duolingo показал, что шахматы можно упаковать как casual learning: короткие уроки, streaks, mini-puzzles, friendly coach. Это важно, потому что снижает страх входа.

**Что Duolingo-подход делает хорошо:**

* делает шахматы менее intimidating;
* работает с короткими daily lessons;
* использует привычку, streak и маленькие победы;
* подходит новичкам.

**Где остаётся возможность:**

* gamified lessons часто оторваны от реальных партий пользователя;
* пользователь может получать “правильно/неправильно”, но не понимать глубинную причину ошибки;
* BlunderLab может соединить gamification с реальными ошибками игрока.

### 3.5 Gap-анализ

| Что уже есть на рынке | Что остаётся незакрытым                          | Возможность BlunderLab                 |
| --------------------- | ------------------------------------------------ | -------------------------------------- |
| Онлайн-игра           | Игрок не понимает, почему проигрывает            | Post-game explanation layer            |
| Engine analysis       | Слишком технический язык                         | Human-readable AI Coach                |
| Puzzles               | Часто не связаны с реальными партиями            | Personalized drills from user mistakes |
| Game Review           | Может быть широким и премиальным                 | Focused “3 things to fix” review       |
| Rating / leaderboard  | Новичку сложно соревноваться с сильными игроками | Top improvers / city leaderboard       |
| Lessons               | Generic learning path                            | Training plan from actual blunders     |

---

## 4. Product Vision

BlunderLab должен стать не “ещё одним сайтом для шахмат”, а маленькой лабораторией мышления, где каждая ошибка превращается в данные для роста.

### 4.1 Vision statement

> BlunderLab helps players turn every chess mistake into a clear, personal training plan.

### 4.2 Product principles

1. **Clarity over depth.** Лучше объяснить 3 ключевые ошибки понятно, чем показать 30 engine lines, которые пользователь не поймёт.
2. **Personal over generic.** Тренировки должны исходить из реальных ошибок пользователя, а не из случайного набора puzzles.
3. **Progress over rating.** Рейтинг важен, но продукт должен показывать улучшение привычек: меньше hanging pieces, меньше missed mate, лучше time control.
4. **Coach, not judge.** Тон продукта не должен унижать игрока за ошибки. Ошибка — это материал для тренировки.
5. **Prototype with startup logic.** Даже если некоторые advanced-фичи реализованы как demo/mocked flow, продукт должен выглядеть как осознанный сервис.

---

## 5. Целевая аудитория

### 5.1 Primary audience

**Motivated beginners и early-intermediate игроки**

Характеристики:

* знают правила шахмат;
* умеют играть онлайн;
* часто проигрывают из-за blunders;
* хотят улучшаться, но не готовы нанимать тренера;
* не всегда понимают engine analysis;
* любят понятный, визуальный, gamified UX.

Пример пользователя:

> “Я играю несколько партий в день, но не понимаю, почему топчусь на месте. Я вижу, что сделал blunder, но не понимаю, как это исправить.”

### 5.2 Secondary audience

**Students / junior developers / builders**

Это важная ниша именно для nFactorial. BlunderLab можно подать как chess training for builders: шахматы как тренажёр паттерн-мышления, анализа ошибок, принятия решений и спокойствия под давлением времени.

Пример пользователя:

> “Я учусь программировать и хочу прокачивать мышление. Мне интересны шахматы не только как игра, но как способ лучше видеть паттерны и анализировать свои решения.”

### 5.3 Tertiary audience

**Chess clubs / schools / mentors**

На более позднем этапе продукт может стать инструментом для тренеров: ученик играет партии, система выделяет слабые места, тренер видит dashboard.

Для MVP это не главный сегмент, но его важно показать в business potential.

---

## 6. Позиционирование

### 6.1 One-liner

> BlunderLab is an AI chess coach that turns your blunders into a personalized training plan.

### 6.2 Короткое описание

BlunderLab — это веб-платформа для шахмат, где пользователь играет партию и получает AI-разбор: ключевые ошибки, понятное объяснение, повторяющиеся паттерны и персональные упражнения.

### 6.3 Чем BlunderLab не является

BlunderLab — это не попытка заменить Chess.com или Lichess.

Продукт не должен соревноваться с ними по масштабу:

* не нужен полноценный турнирный движок;
* не нужен глобальный шахматный портал;
* не нужны десятки режимов;
* не нужен огромный контентный каталог.

BlunderLab должен выиграть за счёт фокуса:

> меньше функций, но более ясная ценность после каждой партии.

### 6.4 Core differentiator

Главный differentiator:

> BlunderLab explains not only what move was wrong, but what thinking pattern caused the mistake.

---

## 7. Основной пользовательский сценарий

### 7.1 First-time experience

1. Пользователь заходит на landing page.
2. Видит обещание: “Turn every blunder into a training plan.”
3. Нажимает “Start training”.
4. Регистрируется через email / Google.
5. Выбирает уровень: beginner / intermediate.
6. Выбирает город для leaderboard: Almaty, Astana, Shymkent, Other.
7. Попадает в первую партию против AI.

### 7.2 Game flow

1. Пользователь играет партию.
2. Система проверяет легальность ходов.
3. После окончания партии появляется CTA: “Review my mistakes”.
4. Пользователь попадает в Game Review.

### 7.3 Game Review

Game Review — главный экран продукта.

Он должен показывать не всё подряд, а только самое важное:

1. **Game summary**

   * результат;
   * примерная accuracy;
   * количество blunders/mistakes;
   * главный вывод.

2. **3 critical moments**

   * позиция на доске;
   * ход пользователя;
   * почему ход был проблемой;
   * лучший ход;
   * короткое human-readable объяснение.

3. **Blunder pattern**

   * например: “Tunnel Vision: you focused on attacking and ignored your king safety.”
   * или: “Loose Pieces: you left pieces undefended 3 times.”

4. **Training recommendation**

   * 3 коротких упражнения;
   * одна цель на следующую партию.

### 7.4 Return loop

После review пользователь получает следующий call-to-action:

> “Play one more game and try to reduce hanging pieces from 4 to 2.”

Это превращает следующую партию в осознанную тренировку, а не просто ещё одну игру.

---

## 8. Build Strategy: что используем готовым, а что делаем как уникальный продуктовый слой

BlunderLab не должен тратить время на изобретение базовой шахматной инфраструктуры с нуля. Для submission важнее показать, что кандидат умеет быстро собирать продукт из зрелых инструментов и фокусироваться на уникальной ценности.

Главный принцип:

> Do not reinvent the chessboard. Reinvent the learning loop after the game.

То есть доска, правила, UI-блоки, базовая авторизация и хранение данных могут опираться на готовые решения. Уникальность BlunderLab должна находиться выше: в post-game review, blunder patterns, AI Coach explanation, training goals, progress dashboard и retention loop.

### 8.1 Что используем

| Слой продукта                 | Инструмент                                  | Зачем используем                                                                                  |
| ----------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Шахматная доска               | `react-chessboard`                          | Готовая интерактивная доска, drag-and-drop, responsive-поведение, кастомизация клеток и фигур     |
| Правила шахмат                | `chess.js`                                  | Проверка легальности ходов, шах, мат, пат, рокировка, взятие на проходе, FEN/PGN, история партии  |
| AI-соперник / engine analysis | Stockfish / stockfish.js                    | Источник шахматной истины: лучший ход, оценка позиции, поиск резких падений evaluation            |
| Backend / база данных         | Supabase                                    | Пользователи, партии, reviews, прогресс, city leaderboard, auth                                   |
| AI Coach API                  | OpenAI API                                  | Human-readable explanations, blunder pattern summary, training goals, короткий coach-style разбор |
| UI-дизайн                     | shadcn/ui                                   | Базовые компоненты интерфейса: cards, buttons, tabs, dialogs, badges, progress, forms             |
| Готовые UI-блоки              | 21st.dev / shadcn-style component libraries | Landing page, pricing cards, dashboard blocks, sidebar, onboarding sections, empty states         |
| Графики / аналитика           | Recharts                                    | Визуализация прогресса: blunders per game, top pattern, games reviewed, weekly trend              |
| Иконки                        | Lucide React                                | Единый современный визуальный язык                                                                |
| Анимации                      | Framer Motion                               | Лёгкие transitions и wow-эффекты без перегруза                                                    |

### 8.2 Как именно используем AI

AI не должен заменять шахматный движок. Шахматный движок должен определять, где ошибка и какой ход был сильнее. AI Coach должен объяснять это человеку.

Правильное разделение:

* Stockfish определяет critical moments.
* `chess.js` хранит и валидирует состояние партии.
* OpenAI объясняет ошибки человеческим языком.
* BlunderLab классифицирует ошибку в понятный паттерн.
* Dashboard превращает это в progress loop.

Пример:

> Stockfish: move evaluation dropped from +0.4 to -2.1.
> BlunderLab: “This was a Tunnel Vision mistake. You attacked the queen, but missed that your back rank was weak.”

### 8.3 Что не делаем с нуля

Чтобы не тратить время на commodity-части, мы сознательно не делаем с нуля:

* шахматную доску;
* drag-and-drop фигур;
* правила шахмат;
* собственный chess engine;
* собственную UI-библиотеку;
* собственную систему auth;
* сложную графическую библиотеку;
* полноценный payment stack, если не хватает времени.

Это не слабость, а правильный продуктовый выбор. В рамках ограниченного времени лучше собрать сильный сервисный прототип, чем вручную реализовывать базовые вещи, которые уже хорошо решены.

### 8.4 Что является уникальным слоем BlunderLab

Уникальность продукта должна быть в следующем:

1. **Blunder Pattern Layer** — пользователь видит не просто mistake/blunder, а тип мышления за ошибкой.
2. **AI Coach Explanation** — ошибки объясняются human-readable языком, без перегруза engine lines.
3. **Training Goal** — после review пользователь получает одну конкретную цель на следующую партию.
4. **Daily Blunder** — персональная daily-позиция из прошлых ошибок.
5. **Progress Dashboard** — пользователь видит, какие паттерны уменьшаются со временем.
6. **City Leaderboard** — соревновательность строится вокруг прогресса, а не только абсолютного рейтинга.
7. **Pro Layer** — продукт показывает бизнес-модель: limited free review → unlimited Pro review / weekly plan / customization.

### 8.5 Mobile-first и адаптивность

Адаптивность — обязательное качество продукта, а не вторичная polish-фича. В задании отдельно указано, что сильный продукт должен быть удобен с телефона. Поэтому BlunderLab проектируется как mobile-first web app.

Критерии адаптивности:

* шахматная доска должна комфортно помещаться на экране телефона;
* фигуры должны удобно перетаскиваться пальцем;
* game review должен читаться карточками, а не широкой таблицей;
* critical moments должны открываться вертикально: board → explanation → best move → training goal;
* dashboard на телефоне должен показывать 3–4 главные карточки, без перегруженных графиков;
* leaderboard должен быть читаемым в одну колонку;
* Pro page и landing должны выглядеть одинаково убедительно на mobile и desktop;
* все основные действия должны быть доступны одной рукой: play, review, next mistake, start training.

Desktop-версия может быть более просторной: доска слева, review-panel справа, analytics в grid-layout. Mobile-версия должна быть не урезанной, а переосмысленной под вертикальный сценарий.

Главное правило:

> BlunderLab should feel like a real mobile-friendly product, not a desktop app squeezed into a phone.

### 8.6 Product demo video

BlunderLab должен быть представлен не только через рабочую ссылку и GitHub, но и через короткое product demo video. Это важно для submission, потому что комиссия должна быстро увидеть не просто набор функций, а полный пользовательский сценарий и главный wow moment продукта.

Для создания демо используем один из двух подходов:

1. **HyperFrame / Hyperframes** — если нужен быстрый, polished product demo с записью интерфейса и красивой подачей.
2. **Remotion** — если хотим сделать более контролируемое scripted demo video прямо из React-компонентов: с кадрами, анимациями, переходами, подписями и последовательным рассказом продукта.

Демо-видео должно быть добавлено:

* на landing page;
* в README.md GitHub-репозитория;
* при необходимости — в submission form как дополнительный proof of work.

Задача демо — показать продукт как сервис, а не как технический эксперимент.

Рекомендуемая структура видео на 45–75 секунд:

1. **Problem hook:** “Most players see their blunders, but don’t understand them.”
2. **Play moment:** пользователь делает ход на доске.
3. **Critical mistake:** система подсвечивает момент, где партия изменилась.
4. **AI Coach:** BlunderLab объясняет ошибку человеческим языком.
5. **Blunder Pattern:** появляется категория, например Tunnel Vision / Hanging Piece.
6. **Training Goal:** продукт предлагает одну цель на следующую партию.
7. **Dashboard:** видно прогресс, top weakness, daily blunder, streak.
8. **Pro layer:** коротко показывается Upgrade to Pro / unlimited reviews.

Главный demo moment:

> Пользователь не просто сыграл партию. Он понял свой паттерн ошибки и получил конкретный следующий шаг.

---

## 9. MVP Scope

MVP должен быть достаточно реалистичным, чтобы его можно было собрать в ограниченный срок, но достаточно продуктовым, чтобы выделиться.

### 9.1 Must-have

| Фича              | Описание                                 | Почему важно                                   |
| ----------------- | ---------------------------------------- | ---------------------------------------------- |
| Legal chess board | Доска с проверкой правил шахмат          | Минимальный продуктовый фундамент              |
| Play vs AI        | Игра против простого AI / Stockfish      | Пользователь может играть без второго человека |
| Game history      | Сохранение партий пользователя           | Нужно для прогресса и возвращаемости           |
| Auth              | Регистрация и профиль                    | Сервис, а не одноразовая демка                 |
| Supabase storage  | Пользователи, партии, базовая статистика | Простая и понятная база для MVP                |
| Post-game review  | Разбор партии после игры                 | Главная ценность продукта                      |
| Top 3 mistakes    | Показывать не всё, а главное             | Уменьшает cognitive overload                   |
| Blunder pattern   | Классификация ошибки                     | Уникальность BlunderLab                        |
| Dashboard         | Прогресс, слабые места, последние партии | Retention и ощущение сервиса                   |
| Responsive UI     | Нормально работает на мобильном          | Шахматы часто играют с телефона                |

### 9.2 Should-have

| Фича             | Описание                                 |
| ---------------- | ---------------------------------------- |
| AI Coach summary | Короткий итог партии человеческим языком |
| Daily Blunder    | Одна позиция в день из прошлой ошибки    |
| City leaderboard | Top improvers by city                    |
| Light/dark theme | Базовая полировка UX                     |
| Pro page         | Демонстрация бизнес-модели               |

### 9.3 Could-have

| Фича                    | Описание                                         |
| ----------------------- | ------------------------------------------------ |
| Multiplayer by link     | Игра с другом по ссылке                          |
| Custom board skins      | Cosmetic monetization                            |
| Weekly report           | Отчёт о прогрессе                                |
| Shareable review card   | Поделиться красивой карточкой партии             |
| Chess for builders mode | Специальная упаковка для студентов/разработчиков |

### 9.4 Out of scope for application prototype

Чтобы не размывать фокус, в первую версию не входят:

* полноценный рейтинг как на Chess.com;
* сложная античит-система;
* турниры;
* полноценная социальная сеть;
* мобильное приложение;
* real-money betting;
* deep coach dashboard для школ;
* полноценная платежная интеграция, если не успеваем безопасно реализовать.

---

## 10. Blunder Taxonomy

Одна из ключевых фич продукта — не просто “mistake”, а понятная классификация ошибок.

### 10.1 Базовые категории

| Категория         | Объяснение для пользователя                                           |
| ----------------- | --------------------------------------------------------------------- |
| Hanging Piece     | Ты оставил фигуру без защиты, и соперник мог её забрать               |
| Missed Tactic     | В позиции был тактический удар, но ты его не увидел                   |
| King Safety       | Ты ослабил защиту короля или проигнорировал угрозу мата               |
| Tunnel Vision     | Ты слишком сфокусировался на своей атаке и не заметил ответ соперника |
| Greedy Move       | Ты взял материал, но получил худшую позицию                           |
| Time Panic        | Ошибка похожа на ход, сделанный слишком быстро или без проверки угроз |
| Opening Drift     | Ты рано отклонился от нормального развития фигур                      |
| Endgame Technique | В эндшпиле был более точный способ реализовать или удержать позицию   |

### 10.2 Почему это важно

Обычный анализ говорит:

> “This was a blunder.”

BlunderLab должен говорить:

> “This was not just a blunder. This was Tunnel Vision: you attacked the queen but missed a checkmate threat.”

Такой формат помогает пользователю увидеть паттерн поведения, а не просто один плохой ход.

---

## 11. Retention Mechanics

### 11.1 Daily Blunder

Каждый день пользователь получает одну позицию из своей прошлой партии:

> “Yesterday you missed this fork. Can you find it today?”

Это сильнее случайного puzzle, потому что связано с личным опытом пользователя.

### 11.2 Weekly Weakness

Раз в неделю dashboard показывает:

* самая частая ошибка;
* динамика;
* сколько партий сыграно;
* что улучшилось;
* что тренировать дальше.

Пример:

> “Your top weakness this week: Loose Pieces. You reduced it from 5.2 to 3.1 per game.”

### 11.3 Streak за анализ, а не просто за игру

В большинстве продуктов streak даётся за активность. В BlunderLab streak должен даваться за осознанное обучение:

* reviewed a game;
* completed daily blunder;
* fixed a repeated pattern;
* played with training goal.

### 11.4 City leaderboard

Глобальный leaderboard демотивирует новичков. Поэтому BlunderLab может использовать локальный, более человеческий leaderboard:

* Top improvers in Almaty;
* Top streaks in Astana;
* Most reviewed games this week;
* Biggest blunder reduction.

Фокус не на абсолютной силе, а на прогрессе.

### 11.5 Identity labels

Пользователь может получать “игровые личности”:

* Blunder Hunter;
* Calm Defender;
* Tactical Sprinter;
* Opening Gambler;
* Endgame Survivor;
* Pattern Seeker.

Это добавляет лёгкую эмоциональность и делает продукт запоминающимся.

---

## 12. Monetization Model

Для прототипа важно не обязательно принять реальные платежи, а показать, что у продукта есть бизнес-логика.

### 12.1 Free tier

* Play vs AI;
* 3 game reviews per day;
* basic blunder patterns;
* city leaderboard;
* limited history.

### 12.2 Pro tier

Ориентировочная цена: $4.99/month или локальный эквивалент.

Pro включает:

* unlimited game reviews;
* deeper AI Coach explanations;
* weekly personalized training plan;
* full mistake history;
* advanced pattern tracking;
* custom boards and piece skins;
* shareable progress reports.

### 12.3 School / Team tier

Будущая B2B-гипотеза:

* группы учеников;
* coach dashboard;
* progress tracking;
* weekly reports;
* city/school tournaments.

### 12.4 Cosmetic monetization

Дополнительный лёгкий слой:

* custom board themes;
* piece skins;
* profile badges;
* review card styles.

Эта монетизация не должна ломать обучение. Платные элементы не должны давать “игровое преимущество”.

---

## 13. Metrics

### 13.1 Activation metrics

* пользователь зарегистрировался;
* сыграл первую партию;
* открыл Game Review;
* посмотрел хотя бы один critical moment;
* начал вторую партию после review.

Главная activation metric:

> % users who complete first game review after first game.

### 13.2 Retention metrics

* D1 return;
* D7 return;
* games reviewed per user;
* daily blunder completion;
* repeated pattern reduction;
* number of users who play again after seeing training goal.

### 13.3 Product quality metrics

* доля партий, где review успешно создан;
* среднее время генерации review;
* user feedback on explanation: helpful / not helpful;
* сколько пользователей нажали “show best move”;
* сколько пользователей завершили suggested drill.

### 13.4 Business metrics

* Pro page click-through;
* Upgrade button clicks;
* free-to-pro intent;
* willingness-to-pay feedback;
* most desired Pro feature.

---

## 14. Product Phases

### Phase 0 — Research & Product Framing

Цель: подготовить продуктовую гипотезу и доказать, что BlunderLab не является “ещё одной шахматной доской”.

Что входит:

* анализ Chess.com, Lichess, Aimchess, Duolingo Chess;
* формулировка product gap;
* выбор ниши;
* PRD;
* design document;
* README pitch structure;
* build scope.

### Phase 1 — Playable MVP

Цель: рабочая веб-игра с понятной доской и базовой AI-партией.

Что входит:

* legal chess board;
* game vs AI;
* basic user profile;
* saving game history;
* responsive layout.

### Phase 2 — BlunderLab Core

Цель: реализовать главную ценность продукта — post-game review.

Что входит:

* top 3 mistakes;
* best move suggestion;
* blunder category;
* AI Coach summary;
* basic dashboard.

### Phase 3 — Service Layer

Цель: показать, что это не pet project, а потенциальный сервис.

Что входит:

* auth + saved progress;
* city leaderboard;
* daily blunder;
* Pro page;
* README with product/business logic;
* polished landing page.

### Phase 4 — Stretch / Great Level

Если останется время:

* multiplayer by link;
* weekly report;
* shareable review cards;
* custom board skins;
* school/team concept page.

---

## 15. UX Requirements

### 15.1 Tone

Тон продукта должен быть:

* умный, но не занудный;
* поддерживающий, но не детский;
* немного лабораторный / experimental;
* friendly for beginners;
* not elitist.

Пример плохого тона:

> “You blundered horribly. This move loses immediately.”

Пример хорошего тона:

> “This was a Tunnel Vision moment. You attacked the queen, but missed the threat against your king.”

### 15.2 Visual direction

BlunderLab должен выглядеть как modern learning product, а не как устаревший шахматный сайт.

Возможная визуальная метафора:

* lab / diagnostics;
* clean dark UI;
* cards for insights;
* highlighted board moments;
* progress dashboard;
* soft “coach” layer.

### 15.3 Key screens

1. Landing page
2. Sign up / onboarding
3. Play screen
4. Game Review
5. Dashboard
6. Daily Blunder
7. Leaderboard
8. Pro page
9. Profile / settings

---

## 16. README Strategy

README должен быть не просто инструкцией по запуску, а коротким product pitch.

### 16.1 README structure

1. Product name + one-liner
2. Problem
3. Solution
4. Target audience
5. Key features
6. Why this is different
7. Business model
8. Tech stack
9. How to run locally
10. Future roadmap

### 16.2 Главное сообщение README

> I intentionally did not try to clone Chess.com or Lichess. Instead, I focused on one product gap: beginners often receive engine feedback but do not understand how to convert it into a learning loop. BlunderLab is built around that loop.

Эта фраза важна: она показывает продуктовый выбор и зрелый scope.

---

## 17. Success Criteria for nFactorial Submission

Продукт должен доказать 4 вещи.

### 17.1 Engineering competence

* приложение работает;
* доска интерактивная;
* правила шахмат соблюдаются;
* есть сохранение данных;
* интерфейс адаптивный;
* код лежит в GitHub.

### 17.2 Product thinking

* есть понятная аудитория;
* есть проблема;
* есть анализ конкурентов;
* есть отличие;
* есть удержание;
* есть monetization hypothesis.

### 17.3 AI usage

* AI используется не как украшение, а как core value;
* AI объясняет ошибки;
* AI помогает сформулировать training plan;
* AI делает продукт умнее, а не просто “генерирует текст”.

### 17.4 Presentation quality

* README читается как mini-pitch;
* landing page объясняет ценность за 10 секунд;
* demo flow показывает “wow moment” после партии;
* продукт выглядит как prototype of a service, not coursework.

---

## 18. Риски и ограничения

### 18.1 Риск: слишком широкий scope

Главная опасность — попытаться сделать всё: multiplayer, AI, payment, leaderboard, coach, puzzles, skins.

Решение:

> Core first: Play → Review → Pattern → Training goal.

Всё остальное вторично.

### 18.2 Риск: AI Coach будет неточным

Если AI объясняет шахматные ошибки неправильно, доверие ломается.

Решение:

* использовать engine evaluation как источник истины;
* AI должен объяснять уже найденные ошибки, а не самостоятельно судить позицию;
* ограничить review только 2–3 critical moments;
* честно писать “prototype explanation”.

### 18.3 Риск: продукт будет выглядеть как wrapper

Если будет просто “Stockfish + ChatGPT explanation”, это может выглядеть поверхностно.

Решение:

* добавить blunder taxonomy;
* добавить dashboard паттернов;
* добавить daily blunder из своей партии;
* добавить clear retention loop.

### 18.4 Риск: не успеть с multiplayer

Multiplayer by link — сильная фича, но не core value.

Решение:

* оставить multiplayer как stretch;
* не жертвовать post-game review ради WebSockets.

---

## 19. Финальная продуктовая ставка

BlunderLab должен быть не самым большим шахматным приложением, а самым понятным прототипом шахматного AI-тренера для роста.

Главная фраза продукта:

> Don’t just see your blunders. Understand them.

Или:

> Turn every blunder into your next training plan.

Если MVP покажет хотя бы один сильный demo moment — пользователь сыграл партию, сделал ошибку, получил понятное объяснение паттерна и персональную цель на следующую партию — продукт уже будет выглядеть сильнее, чем обычная шахматная доска.

---

## 20. Next Documents

После PRD нужно подготовить:

1. Design Document — экраны, UX flow, визуальная система.
2. Technical Build Plan — минимальный, без перегруза: структура проекта, библиотеки, Supabase schema.
3. README draft — product pitch + setup.
4. Implementation checklist — что делать по дням.
5. Demo script — как показать проект комиссии за 2–3 минуты.
