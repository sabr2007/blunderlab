# BlunderLab - Submission Final Scope

Date: 2026-05-02
Status: locked execution scope for final submission sprint
Deadline: 2026-05-03 23:59 Asia/Almaty
Source of truth: `docs/decisions.md`
Related docs: `docs/PRD.md`, `docs/plans/phase-5.md`, `docs/submission.md`, `docs/demo-script.md`

---

## 1. Why this document exists

Phase 5 originally tried to close too many PRD gaps at once: retention, metrics, Pro, PWA, opening book, legal pages, Sentry, skins, public profile, share cards, drills, and more. That is not realistic with one final day before submission.

This document locks the final submission strategy:

> Build the smallest set of visible features that makes BlunderLab feel like a focused AI training product, not a generic chess board.

The final sprint optimizes for committee impact:

- the main learning loop becomes obvious;
- the dashboard shows progress and identity;
- the business model is visible without real payments;
- the product has a clear audience angle for builders;
- risky infrastructure work is avoided.

If another document conflicts with this file, `docs/decisions.md` wins, then this file, then older phase plans.

---

## 2. Product bet for the final sprint

BlunderLab does not win by having the most chess features. It wins by showing a sharper loop:

1. Play a game.
2. Review the critical mistake.
3. Understand the thinking pattern.
4. Receive one concrete training goal.
5. Start the next game with that goal visible.
6. See weakness and identity reflected in the dashboard.

The committee should understand this in 2-3 minutes:

> This is an AI chess coach that turns mistakes into a repeatable improvement loop.

Everything outside that loop is secondary for submission.

---

## 3. Locked must-do scope

### 3.1 Training Goal Continuity

**User-visible promise**

After a review, the next game is not just another random game. The user sees the active training goal from the last review directly on the Play screen.

**Why it matters**

This closes the core PRD loop from `Review` to `Train` to `Return`. It is the most important missing product connection because it proves that BlunderLab is about improvement, not just analysis.

**Implementation scope**

- Add an active goal banner on `/play`.
- Load the latest `training_goal` from the user's most recent review.
- If `/play?goal=<id>` exists, prefer that goal.
- If no goal exists, hide the banner.
- Add dismiss behavior for the current browser session only.
- Keep self-check checkboxes and goal streak logic out of scope.

**Acceptance**

- After review CTA, user lands on Play and sees the training goal.
- Opening `/play` directly also shows the latest goal when available.
- No regression to the existing Play vs Stockfish flow.

### 3.2 Weekly Weakness + Identity Label

**User-visible promise**

The dashboard should tell the user what pattern they are becoming known for and what weakness is changing this week.

**Why it matters**

This makes the dashboard feel like a training product instead of a stats page. It also adds a memorable emotional layer through identity labels.

**Implementation scope**

- Add a Weekly Weakness card to `/dashboard`.
- Compare current 7 days vs previous 7 days when data exists.
- If data is insufficient, show a polished "need more reviewed games" state.
- Add a simplified identity label system:
  - `Newcomer` for users without enough data.
  - `Blunder Hunter` for users with enough reviewed games.
  - `Pattern Seeker` for users with repeated pattern improvement.
  - `Calm Defender` only if existing data makes it cheap.
- Show the label in dashboard and app shell if the app shell already has a suitable user area.
- Do not build public profile pages.
- Do not build a cron-based label system.

**Acceptance**

- Dashboard contains a visible Weekly Weakness card.
- Dashboard contains a visible identity label or a `Newcomer` fallback.
- Empty and low-data users get a strong state, not broken charts.

### 3.3 Training Modes as Pro Value

**User-visible promise**

BlunderLab's Pro value is not cosmetic board skins. Pro unlocks more ways to train.

**Why it matters**

Charging for board palettes feels weak for this product. Charging for training modes fits the core positioning: better analysis, better practice, better improvement loops.

**Implementation scope**

Add a training modes surface, preferably on `/play` or `/dashboard`, with mode cards:

- `Classic Game` - available, current Play vs Stockfish flow.
- `Goal Focus` - available after the user has a training goal; starts a game with the active goal banner.
- `Daily Blunder` - links to the existing Daily Blunder surface.
- `Pattern Drill` - locked Pro preview; explains that it will generate short drills from repeated mistakes.
- `Deep Review` - locked Pro preview; explains unlimited or deeper analysis.
- `Builder Sprint` - locked or preview mode; positions chess as decision training for builders.

This is a product and business demo. The locked modes do not need full engines behind them for submission, but they must look intentional and route users to the Pro or waitlist flow.

**Acceptance**

- User can see multiple training modes from the product surface.
- At least current available modes route correctly.
- Locked Pro modes open the existing Pro or waitlist flow.
- Copy makes it clear that Pro is about training depth, not cosmetic customization.

### 3.4 Chess for Builders Landing

**User-visible promise**

BlunderLab has a specific angle for students, developers, and builders: chess as training for pattern recognition and decision-making under pressure.

**Why it matters**

This is a strong nFactorial-specific positioning move. It connects the project to the audience reviewing it and makes the product feel less generic.

**Implementation scope**

- Add `/builders` under the localized marketing route structure.
- Reuse the existing landing sections and layout.
- Change copy, not component architecture.
- Add `builders.*` messages in EN and RU.
- Focus the page on:
  - pattern recognition;
  - decision-making under pressure;
  - learning from mistakes;
  - training loops for builders.
- Add a footer or landing link to `/builders`.

**Acceptance**

- `/builders` or the locale-aware equivalent renders correctly.
- Page uses the same design system as the main landing.
- CTA leads into the normal Start Training flow.
- No duplicated large landing implementation.

### 3.5 Pro Page Alignment

**User-visible promise**

The Pro page demonstrates a credible business model without pretending payments are live.

**Why it matters**

The PRD requires a monetization hypothesis, not a full Stripe integration. A polished Pro page with locked training modes is enough for submission.

**Implementation scope**

- Keep the existing Pro page if it already works.
- Update copy and tier comparison so Pro value is:
  - unlimited reviews;
  - deeper AI Coach;
  - pattern drills;
  - training modes;
  - weekly personalized plan;
  - full mistake history.
- Remove board skins as the main Pro promise.
- Keep "Payments coming soon" or waitlist capture.
- Do not add Stripe.
- Do not build School tier functionality beyond a teaser card.

**Acceptance**

- Pro page reads as a business demo.
- Upgrade CTA does not imply live payments.
- Waitlist capture remains functional.
- Pro copy matches the final training-mode strategy.

---

## 4. Explicitly not doing for submission

These are out of scope even if they look attractive during implementation:

- Light theme toggle.
- Custom board palettes as paid value.
- Custom piece skins.
- Real Stripe checkout.
- Multiplayer by link.
- Public profile pages.
- Shareable OG review cards.
- Suggested drill engine with real generated puzzle sets.
- Full PostHog funnel.
- WTP survey modal.
- Internal admin metrics dashboard.
- Sentry integration.
- Cookie banner, legal page expansion, GDPR export/delete.
- PWA service worker and install prompt.
- Bottom-sheet system rewrite.
- Real Opening Book, unless it is nearly free after the main scope is complete.
- KZ locale.
- Web push notifications.
- Account merge.
- Upstash Redis rate limiting.

The reason is not that these are bad ideas. The reason is that they do not improve the final demo enough to justify the risk before 2026-05-03 23:59.

---

## 5. Implementation order

Order is based on committee visibility and risk.

### Step 1 - Training Goal Continuity

Do this first because it completes the core loop and is visible during demo.

### Step 2 - Weekly Weakness + Identity Label

Do this second because it upgrades the dashboard from "stats" to "coach memory".

### Step 3 - Training Modes Surface

Do this third because it turns Pro from a static pricing idea into a visible product expansion path.

### Step 4 - Chess for Builders

Do this fourth because it is high-impact positioning with low technical risk if built from existing landing components.

### Step 5 - Pro Page Copy Sync

Do this after the mode surface so the Pro page reflects the same value proposition.

### Step 6 - Verification and submission polish

Run the focused checks:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- targeted browser smoke test for `/play`, `/dashboard`, `/pro`, `/builders`

If time is short, `pnpm typecheck` and `pnpm build` are the minimum hard checks.

---

## 6. Cut rules

### 18:00 on 2026-05-03

If Training Goal Continuity is not working, stop all other feature work and fix it.

### 20:00 on 2026-05-03

Stop adding new features. Only finish incomplete UI states, translations, and broken flows.

### 21:00 on 2026-05-03

Hard stop for scope. Only verification, bug fixes, README/submission text alignment, deploy, and smoke tests.

### 23:59 on 2026-05-03

Submission must use what actually works, not what is still half-built.

---

## 7. Demo narrative

The final demo should follow this path:

1. Landing: "Turn every blunder into your next training plan."
2. Play: user plays a game.
3. Review: AI Coach explains a critical mistake and the pattern behind it.
4. Training Goal: user gets one clear goal.
5. Play again: active goal appears on the next game.
6. Dashboard: weekly weakness and identity label show progress.
7. Training Modes: user sees that BlunderLab can expand into focused practice modes.
8. Builders page: product is positioned as pattern-recognition training for builders.
9. Pro page: business model is visible through deeper training modes and waitlist.

This story is stronger than showing many disconnected features.

---

## 8. Document sync notes

This file intentionally changes earlier planning assumptions:

- Light theme is removed from submission scope.
- Cosmetic board skins are no longer a Phase 5 must-do.
- Pro value is now training modes and deeper learning loops.
- PostHog, Sentry, legal expansion, PWA, public profiles, and share cards are deferred.
- Chess for Builders remains a high-priority final feature.
- Pro page is kept as a business-demo surface, not rebuilt as a payment product.

`docs/PRD.md`, `docs/decisions.md`, and `docs/plans/phase-5.md` must stay aligned with these decisions.
