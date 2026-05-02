import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Goal,
  LineChart,
  TimerReset,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Chess for Builders",
  description:
    "Train pattern recognition, pressure decisions, and review habits with BlunderLab.",
};

const BUILDER_PATTERN_KEYS = [
  "recognition",
  "pressure",
  "postmortem",
  "iteration",
] as const;

export default async function BuildersPage() {
  const t = await getTranslations("builders");
  const common = await getTranslations("common");

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
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
        <div className="flex items-center gap-2">
          <LocaleSwitcher compact />
          <Link
            href="/play"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-bg transition hover:opacity-90"
          >
            {common("startTraining")} <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <section className="container grid gap-10 pb-16 pt-10 md:grid-cols-[0.95fr_1.05fr] md:items-center md:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-fg-muted">
            <Code2 className="size-3.5 text-accent" />
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/50 px-5 py-2.5 text-sm font-medium text-fg transition hover:bg-surface"
            >
              {t("mainLanding")}
            </Link>
          </div>
        </div>

        <div className="surface-card p-5 shadow-2xl shadow-black/30">
          <div className="grid gap-4">
            <div className="rounded-md border border-accent/35 bg-accent/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BrainCircuit className="size-4 text-accent" />
                  {t("coachTitle")}
                </div>
                <Badge variant="accent">Pattern Seeker</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                {t("coachText")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {BUILDER_PATTERN_KEYS.map((pattern, index) => (
                <div
                  key={pattern}
                  className="rounded-md border border-border bg-bg/45 p-4"
                >
                  <span className="font-mono text-xs text-fg-muted">
                    0{index + 1}
                  </span>
                  <p className="mt-3 font-medium">{t(`patterns.${pattern}`)}</p>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-success/35 bg-success/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <Goal className="size-4" />
                {t("goalTitle")}
              </div>
              <p className="mt-2 text-sm text-fg-muted">{t("goalText")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface/35 py-16">
        <div className="container grid gap-4 md:grid-cols-3">
          <BuilderCard
            icon={<BrainCircuit className="size-5" />}
            title={t("cards.patterns.title")}
            text={t("cards.patterns.text")}
          />
          <BuilderCard
            icon={<TimerReset className="size-5" />}
            title={t("cards.pressure.title")}
            text={t("cards.pressure.text")}
          />
          <BuilderCard
            icon={<LineChart className="size-5" />}
            title={t("cards.iteration.title")}
            text={t("cards.iteration.text")}
          />
        </div>
      </section>

      <section className="container py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          {t("ctaEyebrow")}
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-normal md:text-5xl">
          {t("ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-fg-muted">{t("ctaText")}</p>
        <Link
          href="/play"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-90"
        >
          {common("startTraining")} <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}

function BuilderCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="surface-card p-5">
      <span className="grid size-9 place-items-center rounded-md bg-accent/10 text-accent">
        {icon}
      </span>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{text}</p>
    </article>
  );
}
