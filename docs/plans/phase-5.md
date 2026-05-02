# BlunderLab - Phase 5 Plan

Date: 2026-05-02
Status: superseded by final submission scope
Source of truth: [../decisions.md](../decisions.md)
Active execution plan: [submission-final-scope.md](./submission-final-scope.md)

---

## 1. Current decision

The original Phase 5 scope memo was intentionally broad. It listed every remaining PRD gap: light theme, metrics, feedback, Pro expansion, skins, PWA, opening book, public profile, share cards, Sentry, legal pages, cookie banner, and more.

That scope is no longer the active plan.

The active final sprint is now locked in [submission-final-scope.md](./submission-final-scope.md). It is narrower because the project has one final day before the 2026-05-03 23:59 submission deadline.

---

## 2. Must-do for submission

Phase 5 now means only the committee-visible final scope:

1. **Training Goal continuity**
   - `/play` shows the latest training goal from review.
   - The next game feels connected to the previous analysis.

2. **Weekly Weakness + Identity Label**
   - Dashboard shows the user's current weakness trend.
   - Dashboard shows a simple identity label with a strong fallback for low-data users.

3. **Training modes surface**
   - Pro-value is based on better training modes, not cosmetic skins.
   - Available modes route to existing product surfaces.
   - Locked modes route to Pro or waitlist.

4. **Chess for Builders**
   - `/builders` positions BlunderLab for students, developers, and builders.
   - It reuses existing landing components with different copy.

5. **Pro page sync**
   - Existing Pro page remains the business-demo surface.
   - Copy changes from cosmetic customization to deeper training loops.
   - No real payments.

---

## 3. Explicitly removed from submission scope

These items are deferred and must not block submission:

- Light theme toggle.
- Custom board palettes.
- Custom piece skins.
- PostHog full funnel.
- AI Coach feedback database.
- Willingness-to-pay survey.
- Internal `/admin/metrics`.
- Public profile `/u/[handle]`.
- PWA service worker and install prompt.
- Bottom-sheet system rewrite.
- Native share / shareable OG cards.
- Real Opening Book, unless it is nearly free after must-do scope.
- Sentry.
- Privacy/Terms/Cookies expansion.
- Cookie banner.
- GDPR export/delete.
- Real Stripe checkout.
- Multiplayer by link.
- Weekly report email.
- KZ locale.

---

## 4. Why the scope changed

The old Phase 5 plan optimized for PRD completeness. The final plan optimizes for submission impact.

The committee does not need to see every future production feature. They need to see:

- a working chess product;
- a clear AI learning loop;
- progress and retention thinking;
- a credible business model;
- a sharp audience angle.

The final scope does exactly that while keeping risk low.

---

## 5. Implementation order

Follow the order from [submission-final-scope.md](./submission-final-scope.md):

1. Training Goal Continuity.
2. Weekly Weakness + Identity Label.
3. Training Modes Surface.
4. Chess for Builders.
5. Pro Page Copy Sync.
6. Verification and submission polish.

After 21:00 on 2026-05-03, no new features are added. Only verification, bug fixes, deploy, README/submission alignment, and smoke tests.

---

## 6. Acceptance

Phase 5 is done when:

- `/play` can show the active training goal.
- `/dashboard` can show Weekly Weakness and Identity Label.
- The product has a visible training modes surface.
- `/builders` renders and routes to the normal Start Training flow.
- `/pro` communicates training-mode value and waitlist upgrade flow.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass, unless a known external dependency blocks a check and is documented in the final handoff.

All other items remain roadmap.
