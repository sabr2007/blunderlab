# BlunderLab — Design Document v2.1

Дата: Май 2026
Статус: Applied Design Document v2.1
Связанные документы: [PRD v1.1](./PRD.md), [decisions.md (source of truth)](./decisions.md)
Формат: Web Application / nFactorial Incubator Submission
Цель: зафиксировать визуальную систему, экраны, компоненты и demo-ready product experience

> **Все технические и визуальные параметры (палитра, шрифты, фигуры, токены) зафиксированы в [decisions.md](./decisions.md).** Этот документ описывает «как должно ощущаться», decisions.md — «какие именно значения».

**Locked в decisions.md:**
- Board palette: **Graphite** (значения OKLCH в decisions.md §5)
- Pieces: **Cburnett SVG** (поставляется с react-chessboard)
- Font: **Geist Sans + Geist Mono**
- Theme default: **dark**
- 8 blunder categories — финальный список в decisions.md §8

---

## 1. Design Objective

BlunderLab должен выглядеть как настоящий AI-first chess service, а не как учебная шахматная доска.

Главная задача дизайна:

> Сделать так, чтобы продукт визуально доказывал: это не просто игра в шахматы, а умная система анализа ошибок, прогресса и персонального обучения.

Возможная идея “AI coach after chess game” может прийти в голову и другим кандидатам. Поэтому BlunderLab должен выделяться не только концепцией, но и уровнем визуальной упаковки:

* сильный landing;
* выразительная доска;
* качественные шахматные фигуры;
* красивый Game Review;
* понятный dashboard;
* mobile-first experience;
* demo-video-ready интерфейс.

---

## 2. Core Design Thesis

### 2.1 Формула продукта

BlunderLab визуально находится на пересечении трёх миров:

| Слой           | Роль в дизайне                                                         |
| -------------- | ---------------------------------------------------------------------- |
| Chess elegance | Доска, фигуры, ясность ходов, уважение к шахматной культуре            |
| AI diagnostics | Подсветка ошибок, analysis cards, pattern detection, coach explanation |
| Growth product | Dashboard, progress, streaks, goals, retention loops                   |

Итоговая формула:

> **60% modern AI/SaaS product + 20% chess elegance + 20% learning/growth experience**

### 2.2 Design sentence

> BlunderLab is where chess meets diagnostics.

Это означает, что интерфейс должен ощущаться как “лаборатория шахматного мышления”: спокойный, умный, точный, визуально сильный.

---

## 3. Visual Positioning

### 3.1 Не делаем Chess.com clone

BlunderLab не должен выглядеть как:

* Chess.com lite;
* Lichess clone;
* обычный chessboard project;
* admin dashboard с приклеенной доской;
* техническая демка Stockfish;
* слишком детский learning app;
* слишком геймерский neon-product.

### 3.2 Как должен ощущаться продукт

Продукт должен ощущаться как:

* polished indie startup;
* AI productivity tool;
* personal learning cockpit;
* premium chess analysis lab;
* приложение, в которое хочется вернуться после партии.

### 3.3 Главный визуальный контраст

Обычный шахматный сайт говорит:

> “Play chess.”

BlunderLab должен говорить:

> “Understand how you think when you lose.”

Это должно быть видно в каждом важном экране.

---

## 4. Mood & Visual References

### 4.1 Mood keywords

* precise;
* calm;
* intelligent;
* premium;
* analytical;
* focused;
* modern;
* slightly experimental;
* supportive;
* not childish.

### 4.2 Визуальные ассоциации

BlunderLab можно представить как сочетание:

* современного AI SaaS dashboard;
* шахматной аналитической студии;
* персонального тренажёра мышления;
* лаборатории ошибок;
* clean product demo из YC/indie startup среды.

### 4.3 Что можно использовать как reference-подход

Не копировать буквально, но держать в голове:

* Linear — чистота, фокус, премиальность интерфейса;
* Vercel / v0 — AI-first product feel;
* Duolingo — daily habit / learning loop, но без детскости;
* Chess.com — понятность review, но без перегруза;
* Lichess — уважение к шахматной функциональности;
* Replit / Cursor — продукт для builders и learners.

---

## 5. Color System

### 5.1 Основной подход

Цветовая система должна поддерживать идею “chess diagnostics”.

Не делаем деревянно-коричневый классический chess look.
Не делаем агрессивный neon-gaming look.
Делаем современный dark/light interface с сильной семантикой.

### 5.2 Base palette

Рекомендуемая палитра:

| Назначение      | Цветовая идея          | Использование                    |
| --------------- | ---------------------- | -------------------------------- |
| Deep background | near-black / graphite  | hero, app shell, review mode     |
| Surface         | dark slate / soft gray | cards, panels, dashboard blocks  |
| Light surface   | warm off-white         | light mode, cards, text areas    |
| Primary accent  | cobalt / electric blue | AI Coach, focus, active states   |
| Success         | emerald green          | best move, progress, improvement |
| Warning         | amber                  | critical moment, inaccuracy      |
| Danger          | coral / soft red       | blunder, losing move, risk       |
| Neutral         | slate gray             | secondary UI, borders, metadata  |

### 5.3 Semantic color rules

* **Blue** = AI insight / active focus / coach layer
* **Green** = best move / improvement / completed goal
* **Amber** = caution / critical moment / review attention
* **Red** = blunder / danger / major evaluation drop
* **Gray** = supporting information

### 5.4 Board colors

Доска должна быть calm, not noisy.

Возможные направления:

1. **Graphite board**

   * dark square: muted graphite
   * light square: soft slate
   * best for dark UI

2. **Warm minimal board**

   * dark square: muted taupe/olive gray
   * light square: warm cream
   * best for premium editorial feel

3. **Lab board**

   * dark square: deep blue-gray
   * light square: desaturated cyan-gray
   * best for AI diagnostics feel

Для MVP лучше выбрать один основной board style и довести его до polished state.

---

## 6. Typography

### 6.1 Typographic direction

Основной шрифт должен быть clean sans-serif:

* хорошо читается в интерфейсе;
* подходит для dashboard;
* выглядит современно;
* не спорит с шахматной доской;
* нормально работает на мобильном.

### 6.2 Suggested type approach

* UI font: Inter / Geist / similar modern sans
* Display font: можно оставить тот же, чтобы не перегружать
* Mono font: только для FEN/PGN/debug-like fragments, если нужно

### 6.3 Text hierarchy

| Текст             | Характер                                   |
| ----------------- | ------------------------------------------ |
| Hero headline     | сильный, короткий, product-led             |
| Coach explanation | conversational, readable, supportive       |
| Review labels     | короткие, precise                          |
| Dashboard cards   | сканируемые, без длинного текста           |
| Mobile text       | максимально короткий, 1 мысль = 1 карточка |

---

## 7. Chess Board Design

### 7.1 Роль доски

Доска — главный визуальный объект продукта. Она должна работать в трёх режимах:

1. **Play Mode** — пользователь играет.
2. **Review Mode** — пользователь разбирает партию.
3. **Critical Moment Mode** — продукт показывает конкретную ошибку и лучший ход.

### 7.2 Play Mode

В Play Mode доска должна быть:

* clean;
* responsive;
* touch-friendly;
* visually calm;
* без лишних аналитических элементов;
* с понятной подсветкой legal moves / selected piece / last move.

### 7.3 Review Mode

В Review Mode доска становится аналитическим объектом.

Нужны элементы:

* подсветка хода пользователя;
* подсветка лучшего хода;
* стрелка best move;
* marker на фигуре под угрозой;
* color-coded square для critical mistake;
* stepper между critical moments.

### 7.4 Critical Moment Mode

Это demo-friendly состояние. Оно должно красиво выглядеть на скриншотах и в видео.

На экране должно быть понятно:

* где была ошибка;
* какая фигура важна;
* куда нужно было пойти;
* почему это mattered.

### 7.5 Board micro-interactions

* smooth piece movement;
* subtle highlight on selected square;
* animated reveal of best move arrow;
* small pulse on blunder square;
* transition between critical moments.

Важно: motion помогает понять, а не превращает интерфейс в игру с эффектами.

---

## 8. Chess Pieces Design

### 8.1 Почему фигуры важны

Фигуры — самый частый визуальный объект после доски. Если они выглядят дефолтно и скучно, весь продукт сразу теряет уникальность.

### 8.2 Требования к фигурам

Фигуры должны быть:

* readable at small size;
* premium;
* modern;
* не мультяшные;
* не чрезмерно классические;
* хорошо различимые на dark/light board;
* подходящие для mobile.

### 8.3 Рекомендуемый стиль

Лучший стиль для MVP:

> modern minimal chess set with elegant silhouettes

Не нужно делать слишком кастомный набор с нуля, если это съест время. Можно использовать готовый качественный SVG-set, но важно:

* подобрать его осознанно;
* проверить на mobile;
* проверить на dark/light board;
* использовать consistent visual weight;
* не смешивать разные стили фигур.

### 8.4 Возможность Pro layer

В MVP можно заложить future-facing идею:

* Classic set;
* Minimal set;
* Lab set;
* Neon set;
* Premium set.

Но реально реализовать достаточно один polished набор + визуально показать, что custom skins могут быть частью Pro.

---

## 9. Core Screens Overview

Основные экраны продукта:

1. Landing Page
2. Sign Up / Onboarding
3. Play Screen
4. Game Review
5. Dashboard
6. Daily Blunder
7. City Leaderboard
8. Pro / Upgrade Page
9. Profile / Settings
10. Demo Video Embed

Каждый экран должен усиливать одну общую мысль:

> BlunderLab turns mistakes into progress.

---

## 10. Landing Page Spec

### 10.1 Цель лендинга

Лендинг должен за 5–10 секунд объяснить:

* что это шахматный AI-тренер;
* чем он отличается от обычной шахматной доски;
* почему после партии пользователь получает реальную ценность;
* что продукт выглядит как полноценный сервис.

### 10.2 Hero section

Hero должен быть самым сильным визуальным блоком.

#### Headline options

1. **Turn every blunder into your next training plan.**
2. **Don’t just see your mistakes. Understand them.**
3. **Your AI chess coach after every game.**
4. **Chess review that explains how you think.**

Рекомендуемый headline:

> **Turn every blunder into your next training plan.**

#### Subheadline

> BlunderLab reviews your games, explains your mistakes in plain language, detects recurring patterns, and gives you one clear goal for the next match.

#### CTA

Primary:

> Start training

Secondary:

> Watch demo

### 10.3 Hero visual

Hero visual должен быть не generic screenshot, а product composition:

* центральная доска с подсвеченным critical moment;
* справа AI Coach card;
* снизу small dashboard stats;
* на фоне subtle grid / lab feel;
* можно показать mobile preview рядом.

### 10.4 Landing sections

1. **Hero**
2. **Problem** — “Engine analysis tells you what was wrong. BlunderLab shows why you repeated it.”
3. **How it works** — Play → Review → Pattern → Train
4. **Game Review preview** — карточка critical moment
5. **Pattern taxonomy** — Hanging Piece, Tunnel Vision, King Safety, Greedy Move
6. **Dashboard preview** — progress over time
7. **Daily Blunder** — personal puzzle from your own mistakes
8. **Pricing / Pro concept**
9. **Demo video**
10. **Final CTA**

### 10.5 Landing visual requirement

Лендинг должен выглядеть как страница реального продукта. Не как README, не как школьный проект, не как просто “описание фич”.

---

## 11. Onboarding Spec

### 11.1 Цель onboarding

Onboarding не должен быть длинным. Его цель — быстро довести пользователя до первой партии.

### 11.2 Минимальный onboarding

1. Sign up / continue as guest для demo mode
2. Choose skill level:

   * Beginner
   * Intermediate
   * Advanced
3. Choose city:

   * Almaty
   * Astana
   * Shymkent
   * Other
4. Start first game

### 11.3 Почему нужен city

City нужен не ради сложности, а чтобы позже включить локальный leaderboard:

* Top improvers in Almaty;
* Top review streaks in Astana;
* Top blunder hunters in Shymkent.

Это добавляет social layer без сложной социальной сети.

---

## 12. Play Screen Spec

### 12.1 Desktop layout

Desktop layout:

* left: chessboard;
* right: game panel;
* top: product nav / user profile;
* bottom/right: action buttons.

Game panel содержит:

* player vs AI;
* move history;
* current turn;
* captured pieces;
* difficulty;
* resign / restart;
* after game: “Review my mistakes”.

### 12.2 Mobile layout

Mobile layout:

1. Top bar: logo, game status, profile
2. Chessboard full-width
3. Compact action row
4. Collapsible move history
5. Review CTA after game

Mobile не должен быть урезан. Он должен быть основным сценарием.

### 12.3 Play screen design rules

* минимум отвлечения;
* доска — главный объект;
* action buttons не спорят с доской;
* move history не занимает слишком много места;
* всё работает пальцем;
* last move и selected square читаются сразу.

---

## 13. Game Review Screen Spec

### 13.1 Главная роль

Game Review — сердце BlunderLab.

Если пользователь запомнит только один экран, это должен быть Game Review.

### 13.2 Desktop layout

Рекомендуемая структура:

* left: board / critical moment;
* right: review panel;
* top: game summary;
* bottom: critical moments carousel / next training goal.

### 13.3 Mobile layout

Mobile structure:

1. Game summary card
2. Board with highlighted critical moment
3. AI Coach card
4. Blunder Pattern card
5. Best move card
6. Training Goal card
7. CTA: Play again with this goal

### 13.4 Review components

#### Game Summary Card

Содержит:

* result;
* accuracy-like score;
* number of mistakes;
* main weakness;
* coach verdict.

Example:

> You lost control after move 14. Your main pattern: Tunnel Vision — you attacked while leaving your king exposed.

#### Critical Moment Card

Содержит:

* move number;
* user move;
* best move;
* why it mattered;
* small severity label.

#### AI Coach Card

Тон:

* supportive;
* direct;
* short;
* not humiliating.

Example:

> This was a Tunnel Vision moment. You focused on attacking the queen, but missed the back-rank threat against your king.

#### Blunder Pattern Card

Показывает:

* pattern name;
* short definition;
* how often it appeared;
* what to watch next game.

#### Training Goal Card

Example:

> Next game goal: Before every attacking move, check if your king or queen becomes undefended.

### 13.5 Game Review visual priority

Текст должен быть коротким. Главные мысли — в карточках. Доска и подсветки должны помогать понять объяснение без длинного чтения.

---

## 14. Dashboard Spec

### 14.1 Цель Dashboard

Dashboard должен доказать, что BlunderLab — это сервис для прогресса, а не одноразовый review.

### 14.2 Основные карточки

1. **Games reviewed**
2. **Current streak**
3. **Top weakness**
4. **Blunders reduced**
5. **Daily Blunder**
6. **Recent games**
7. **Pattern trend**
8. **City rank**

### 14.3 Desktop layout

* cards grid;
* larger progress chart;
* daily blunder preview;
* recent reviews list;
* city leaderboard mini-widget.

### 14.4 Mobile layout

* one-column cards;
* top 3 stats first;
* Daily Blunder near top;
* charts simplified;
* recent games collapsed.

### 14.5 Dashboard tone

Dashboard должен говорить:

> You are improving because you are reviewing.

Не просто:

> You played 12 games.

---

## 15. Daily Blunder Spec

### 15.1 Product idea

Daily Blunder — это персональный puzzle из прошлой ошибки пользователя.

Не случайная позиция. Не generic puzzle. Своя ошибка.

### 15.2 Screen structure

* title: “Today’s Blunder”
* source: “From your game yesterday”
* board position
* prompt: “Find the move you missed”
* answer reveal
* short coach explanation
* CTA: “Play with this pattern in mind”

### 15.3 Visual value

Daily Blunder создаёт:

* персональность;
* retention;
* learning continuity;
* ощущение, что продукт помнит пользователя.

---

## 16. City Leaderboard Spec

### 16.1 Concept

Leaderboard должен быть не про абсолютную силу, а про рост.

Возможные рейтинги:

* Top improvers in Almaty;
* Longest review streak in Astana;
* Most blunders reduced this week;
* Most consistent reviewers;
* Rising players.

### 16.2 Почему так

Новичок не будет мотивирован leaderboard, где наверху сильные игроки. Но он может быть мотивирован leaderboard, где учитывается effort и improvement.

### 16.3 Visual structure

* city filter;
* weekly tab;
* compact user rows;
* badge for improvement;
* friendly copy, not aggressive competition.

---

## 17. Pro / Upgrade Page Spec

### 17.1 Цель

Pro page показывает business thinking. Даже если payments не будут fully functional, страница должна выглядеть как реальная SaaS-монетизация.

### 17.2 Pricing tiers

#### Free

* 3 reviews/day;
* basic blunder patterns;
* limited history;
* city leaderboard.

#### Pro

* unlimited reviews;
* deeper AI Coach;
* weekly training plans;
* full pattern history;
* custom boards and piece skins;
* shareable progress cards.

#### School / Team

* coach dashboard;
* student groups;
* weekly reports;
* class leaderboard.

### 17.3 Visual requirement

Pricing cards должны быть polished и credible. Это не должна быть “кнопка Upgrade, приклеенная для галочки”.

---

## 18. Component Strategy

### 18.1 Base components

Используем shadcn/ui как базовую систему.

Нужные компоненты:

* Button;
* Card;
* Badge;
* Tabs;
* Dialog;
* Sheet;
* Progress;
* Tooltip;
* Dropdown;
* Avatar;
* Table;
* Form;
* Input;
* Sidebar;
* Toast.

### 18.2 Ready-made blocks

Можно использовать 21st.dev / shadcn-style component libraries для:

* landing hero;
* pricing cards;
* dashboard grid;
* feature sections;
* onboarding layout;
* empty states;
* sidebar shell;
* stats blocks.

### 18.3 Chess-specific components

Создаём/адаптируем:

* ChessBoardWrapper;
* MoveHistory;
* GameStatus;
* CriticalMomentCard;
* AICoachCard;
* BlunderPatternBadge;
* TrainingGoalCard;
* DailyBlunderCard;
* CityLeaderboardCard;
* ReviewStepper.

---

## 19. Mobile-First Layout Rules

### 19.1 Основной принцип

> Mobile version is not a reduced desktop. It is a rethought vertical experience.

### 19.2 Mobile rules

* доска full-width;
* минимум боковых панелей;
* review через вертикальные карточки;
* sticky CTA только там, где это помогает;
* крупные tap targets;
* минимум мелкого текста;
* one idea per card;
* charts simplified;
* leaderboard one-column;
* Pro cards stacked.

### 19.3 Desktop rules

Desktop может быть богаче:

* board + side panel;
* grid dashboard;
* multi-column landing;
* larger preview screenshots;
* more visible analytics.

---

## 20. Motion Design

### 20.1 Где использовать motion

* hero product preview;
* board highlight reveal;
* best move arrow animation;
* AI Coach typing/reveal;
* critical moments carousel;
* dashboard counter updates;
* Daily Blunder answer reveal;
* Pro card hover.

### 20.2 Motion principles

* short;
* subtle;
* purposeful;
* clarity-first;
* no excessive gamification.

Motion должен помогать пользователю понять, что произошло.

---

## 21. Demo Video Requirements

### 21.1 Почему demo важен

BlunderLab должен быть demo-first. Комиссия может не проходить весь пользовательский путь вручную, поэтому видео должно быстро показать главный wow moment.

### 21.2 Инструменты

Используем:

* HyperFrame / Hyperframes — для polished screen recording / product demo;
* Remotion — если нужен scripted React-based video с контролем кадров, подписями и анимацией.

### 21.3 Где размещаем

* landing page;
* README.md;
* submission materials;
* возможно, GitHub repo preview.

### 21.4 Demo structure

45–75 секунд:

1. Problem hook
2. User plays a move
3. Blunder detected
4. Critical moment highlighted
5. AI Coach explanation
6. Blunder Pattern appears
7. Training Goal appears
8. Dashboard progress
9. Upgrade / Pro hint
10. Final tagline

### 21.5 Demo tagline

> Don’t just see your blunders. Understand them.

---

## 22. Screen-by-Screen Demo Story

Это сценарий, под который стоит проектировать интерфейс.

### Scene 1 — Landing

Пользователь видит:

> Turn every blunder into your next training plan.

На экране — доска, AI Coach card, dashboard preview.

### Scene 2 — Play

Пользователь играет против AI. Всё clean, понятно, красиво.

### Scene 3 — Mistake

Пользователь делает ход. После партии нажимает:

> Review my mistakes

### Scene 4 — Review

Система показывает critical moment:

* плохой ход;
* лучший ход;
* подсветку на доске.

### Scene 5 — AI Coach

Coach говорит:

> This was a Tunnel Vision moment. You attacked the queen, but missed the threat against your king.

### Scene 6 — Training Goal

Появляется цель:

> Next game: before every attacking move, check whether your king is safe.

### Scene 7 — Dashboard

Видно:

* top weakness;
* daily blunder;
* streak;
* city rank.

### Scene 8 — Product close

Финальный экран:

> BlunderLab — your AI chess coach after every game.

---

## 23. README Visual Requirements

README должен содержать не только текст, но и визуальные proof points:

* hero screenshot;
* short demo GIF/video;
* Game Review screenshot;
* dashboard screenshot;
* mobile screenshot;
* feature list;
* product thinking explanation.

README должен выглядеть как mini-product page внутри GitHub.

---

## 24. Design Success Criteria

Дизайн успешен, если:

1. продукт за 10 секунд отличается от обычной шахматной доски;
2. landing page выглядит как страница реального сервиса;
3. шахматная доска имеет характер;
4. фигуры выглядят осознанно, а не дефолтно;
5. Game Review создаёт wow moment;
6. dashboard показывает реальную идею прогресса;
7. mobile версия выглядит нативно для телефона;
8. demo video легко собрать из существующих экранов;
9. README screenshots выглядят убедительно;
10. комиссия видит product sense до чтения кода.

---



## 26. Final Design Principle

Главный принцип дизайна BlunderLab:

> The idea may be similar. The product feeling must be unforgettable.

BlunderLab должен выглядеть так, будто это уже маленький, цельный, красивый AI chess service — сервис, который не просто показывает ошибку, а помогает пользователю увидеть собственный паттерн мышления и сделать следующий шаг.
