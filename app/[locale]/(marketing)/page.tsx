import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  CirclePlay,
  Crosshair,
  Goal,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const PATTERNS = [
  "Hanging Piece",
  "Missed Tactic",
  "King Safety",
  "Tunnel Vision",
  "Greedy Move",
  "Time Panic",
  "Opening Drift",
  "Endgame Technique",
] as const;

const TIERS = [
  {
    name: "Free",
    price: "$0",
    features: ["3 reviews/day", "Daily Blunder", "City leaderboard"],
  },
  {
    name: "Pro",
    price: "$4.99",
    features: ["Unlimited reviews", "Full history", "Weekly plan"],
  },
  {
    name: "School",
    price: "Custom",
    features: ["Class dashboard", "Coach view", "Team ranking"],
  },
] as const;

const BOARD_SQUARES = Array.from({ length: 64 }, (_, index) => ({
  id: `square-${index}`,
  isLight: (Math.floor(index / 8) + index) % 2 === 0,
}));

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const common = await getTranslations("common");
  const patterns = await getTranslations("patterns");

  return (
    <main className="relative overflow-hidden">
      <div className="lab-grid pointer-events-none absolute inset-0 -z-10 opacity-25" />

      <header className="container flex items-center justify-between py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-normal"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
            ◇
          </span>
          {common("brand")}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-fg-muted md:flex">
          <a href="#how-it-works" className="hover:text-fg">
            {t("navHow")}
          </a>
          <a href="#patterns" className="hover:text-fg">
            {t("navPatterns")}
          </a>
          <Link href="/pro" className="hover:text-fg">
            {t("navPricing")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher compact />
          <Link
            href="/sign-in"
            className="hidden text-sm text-fg-muted hover:text-fg sm:inline"
          >
            {common("signIn")}
          </Link>
          <Link
            href="/play"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-bg transition hover:opacity-90"
          >
            {common("startTraining")} <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <section className="container grid gap-10 pb-20 pt-10 md:grid-cols-[minmax(0,0.92fr)_minmax(360px,1fr)] md:items-center md:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-fg-muted">
            <span className="size-1.5 rounded-full bg-success" />
            {t("prototype")}
          </span>
          <h1 className="text-display mt-6 text-balance">{t("heroTitle")}</h1>
          <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-fg-muted">
            {t("heroText")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/play"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-90"
            >
              {common("startTraining")} <ArrowRight className="size-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/50 px-5 py-2.5 text-sm font-medium text-fg transition hover:bg-surface"
            >
              <CirclePlay className="size-4" />
              {t("watchDemo")}
            </a>
          </div>
        </div>

        <HeroComposition
          coachText={t("previewCoach")}
          goalTitle={t("previewGoal")}
          goalText={t("previewGoalText")}
        />
      </section>

      <section className="container grid gap-4 pb-16 md:grid-cols-3">
        <Stat label={t("statReviews")} value="3" hint={t("statReviewsHint")} />
        <Stat
          label={t("statPatterns")}
          value="8"
          hint={t("statPatternsHint")}
        />
        <Stat label={t("statLoop")} value="4" hint={t("statLoopHint")} />
      </section>

      <section className="border-y border-border bg-surface/35 py-16">
        <div className="container grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              {t("problemEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
              {t("problemTitle")}
            </h2>
          </div>
          <div className="grid gap-3">
            <blockquote className="rounded-md border border-accent/35 bg-accent/10 p-5 text-lg leading-relaxed">
              “{t("problemQuote")}”
            </blockquote>
            <div className="grid gap-3 md:grid-cols-2">
              <p className="rounded-md border border-border bg-bg/45 p-4 text-sm text-fg-muted">
                {t("problemEngine")}
              </p>
              <p className="rounded-md border border-success/30 bg-success/10 p-4 text-sm text-success">
                {t("problemBlunderLab")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            {t("howEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
            {t("howTitle")}
          </h2>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-4">
          <Step
            icon={<Swords className="size-5" />}
            number="01"
            title={t("stepPlayTitle")}
            text={t("stepPlayText")}
          />
          <Step
            icon={<Crosshair className="size-5" />}
            number="02"
            title={t("stepReviewTitle")}
            text={t("stepReviewText")}
          />
          <Step
            icon={<BrainCircuit className="size-5" />}
            number="03"
            title={t("stepPatternTitle")}
            text={t("stepPatternText")}
          />
          <Step
            icon={<Goal className="size-5" />}
            number="04"
            title={t("stepTrainTitle")}
            text={t("stepTrainText")}
          />
        </div>
      </section>

      <section className="container grid gap-10 pb-20 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            {t("previewEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
            {t("previewTitle")}
          </h2>
        </div>
        <div className="grid gap-3">
          <PreviewRow icon={<Target className="size-4" />} label="Pattern">
            Tunnel Vision
          </PreviewRow>
          <PreviewRow icon={<Sparkles className="size-4" />} label="Coach">
            {t("previewCoach")}
          </PreviewRow>
          <PreviewRow
            icon={<Goal className="size-4" />}
            label={t("previewGoal")}
          >
            {t("previewGoalText")}
          </PreviewRow>
        </div>
      </section>

      <section
        id="patterns"
        className="border-y border-border bg-surface/35 py-20"
      >
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              {t("taxonomyEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
              {t("taxonomyTitle")}
            </h2>
            <p className="mt-4 text-fg-muted">{t("taxonomyText")}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PATTERNS.map((name, index) => (
              <article
                key={name}
                className="surface-card p-5 transition hover:border-accent/40"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium tracking-normal">{name}</h3>
                  <span className="font-mono text-xs text-fg-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-fg-muted">{patterns(name)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container grid gap-5 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-6 md:p-7">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            {t("dashboardEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
            {t("dashboardTitle")}
          </h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <MiniMetric
              icon={<ChartNoAxesCombined />}
              label="Top weakness"
              value="Tunnel Vision"
            />
            <MiniMetric icon={<Sparkles />} label="Streak" value="4d" />
            <MiniMetric icon={<Trophy />} label="City rank" value="#12" />
            <MiniMetric icon={<Target />} label="Daily Blunder" value="Ready" />
          </div>
        </div>
        <div className="surface-card p-6 md:p-7">
          <Badge variant="success">Daily Blunder</Badge>
          <h3 className="mt-5 text-2xl font-semibold tracking-normal">
            {t("dailyTitle")}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            {t("dailyText")}
          </p>
          <div className="mt-6 aspect-square rounded-md border border-border bg-bg/60 p-4">
            <div className="grid h-full grid-cols-8 grid-rows-8 overflow-hidden rounded-md border border-border">
              {BOARD_SQUARES.map((square) => (
                <span
                  key={square.id}
                  className={
                    square.isLight ? "bg-board-light" : "bg-board-dark"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              {t("pricingEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
              {t("pricingTitle")}
            </h2>
          </div>
          <Link
            href="/pro"
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            {t("pricingLink")} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              className={`surface-card p-5 ${
                tier.name === "Pro" ? "border-accent bg-accent/5" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="font-mono text-xl">{tier.price}</p>
              </div>
              <ul className="mt-5 grid gap-2 text-sm text-fg-muted">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="demo" className="border-y border-border bg-surface/35 py-20">
        <div className="container">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            {t("demoEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
            {t("demoTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {t("demoText")}
          </p>
          <div
            aria-label={t("demoPlaceholderLabel")}
            className="mt-8 aspect-video w-full rounded-md border border-dashed border-border bg-bg/35"
          />
        </div>
      </section>

      <section className="container py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-normal md:text-5xl">
          {t("finalTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-fg-muted">{t("finalText")}</p>
        <Link
          href="/play"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-90"
        >
          {common("startTraining")} <ArrowRight className="size-4" />
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-fg-muted md:flex-row">
          <p>© 2026 BlunderLab · nFactorial Incubator</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://github.com/sabr2007/blunderlab"
              className="hover:text-fg"
            >
              GitHub
            </a>
            <a
              href="https://github.com/sabr2007/blunderlab/blob/main/docs/decisions.md"
              className="hover:text-fg"
            >
              {t("footerDocs")}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroComposition({
  coachText,
  goalTitle,
  goalText,
}: {
  coachText: string;
  goalTitle: string;
  goalText: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="surface-card p-4 shadow-2xl shadow-black/30 md:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="aspect-square overflow-hidden rounded-md border border-border bg-bg/50 p-3">
            <div className="grid h-full grid-cols-8 grid-rows-8 overflow-hidden rounded-md">
              {BOARD_SQUARES.map((square) => (
                <span
                  key={square.id}
                  className={
                    square.isLight ? "bg-board-light" : "bg-board-dark"
                  }
                />
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-md border border-danger/35 bg-danger/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.16em] text-danger">
                  Critical moment
                </span>
                <Badge variant="danger">Blunder</Badge>
              </div>
              <p className="mt-3 font-mono text-2xl">17. Qh5?</p>
            </div>
            <div className="rounded-md border border-accent/35 bg-accent/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BrainCircuit className="size-4 text-accent" />
                BlunderLab Coach
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                {coachText}
              </p>
            </div>
            <div className="rounded-md border border-success/35 bg-success/10 p-4">
              <p className="text-sm font-medium text-success">{goalTitle}</p>
              <p className="mt-2 text-sm text-fg-muted">{goalText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="surface-card flex flex-col gap-1 p-5">
      <span className="text-xs uppercase tracking-[0.16em] text-fg-muted">
        {label}
      </span>
      <span className="font-mono text-3xl tracking-normal">{value}</span>
      <span className="text-xs text-fg-muted">{hint}</span>
    </div>
  );
}

function Step({
  icon,
  number,
  title,
  text,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article className="surface-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-9 place-items-center rounded-md bg-accent/10 text-accent">
          {icon}
        </span>
        <span className="font-mono text-xs text-fg-muted">{number}</span>
      </div>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{text}</p>
    </article>
  );
}

function PreviewRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">{children}</p>
    </div>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-bg/45 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-3 font-mono text-2xl">{value}</p>
    </div>
  );
}
