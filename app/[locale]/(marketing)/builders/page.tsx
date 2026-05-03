import { Reveal } from "@/components/common/reveal";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
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

const PATTERN_KEYS = [
  "recognition",
  "pressure",
  "postmortem",
  "iteration",
] as const;

export default async function BuildersPage() {
  const t = await getTranslations("builders");
  const common = await getTranslations("common");
  const footer = await getTranslations("footer");

  const footerCols = {
    product: [
      { label: footer("linkPlay"), href: "/play" },
      { label: footer("linkDashboard"), href: "/dashboard" },
      { label: footer("linkPro"), href: "/pro" },
      { label: footer("linkBuilders"), href: "/builders" },
    ],
    resources: [
      {
        label: footer("linkDocs"),
        href: "https://github.com/sabr2007/blunderlab/blob/main/docs/decisions.md",
        external: true,
      },
      {
        label: footer("linkChangelog"),
        href: "https://github.com/sabr2007/blunderlab/commits/main",
        external: true,
      },
      {
        label: footer("linkRoadmap"),
        href: "https://github.com/sabr2007/blunderlab/blob/main/docs/PRD.md",
        external: true,
      },
    ],
    company: [
      { label: footer("linkAbout"), href: "/builders" },
      {
        label: footer("linkContact"),
        href: "https://github.com/sabr2007/blunderlab",
        external: true,
      },
      { label: footer("linkPrivacy"), href: "/" },
    ],
  };

  return (
    <div className="relative">
      <MarketingNav signInLabel={common("signIn")} />

      <main>
        {/* HERO -------------------------------------------------- */}
        <section className="relative isolate overflow-hidden pb-12 pt-12 md:pb-20 md:pt-20">
          <div className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-30" />
          <div
            aria-hidden
            className="hero-orb pointer-events-none absolute right-[-10%] top-[8%] -z-10 h-[600px] w-[700px]"
          />

          <div className="container grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/80 px-3.5 py-1.5 text-xs text-fg-muted backdrop-blur">
                  <Code2 className="size-3.5 text-accent" />
                  {t("prototype")}
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="text-display mt-6 font-semibold text-balance">
                  Pattern recognition is your{" "}
                  <span className="text-amber-emphasis">superpower</span>. Train
                  it on chess.
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-pretty mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
                  {t("heroText")}
                </p>
              </Reveal>
              <Reveal delay={220}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/sign-in"
                    className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                  >
                    {common("signIn")}
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/"
                    className="btn-secondary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                  >
                    {t("mainLanding")}
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={280}>
              <div className="surface-card surface-grain relative overflow-hidden p-6 shadow-[0_30px_70px_oklch(0%_0_0/0.45)]">
                <div className="grid gap-3">
                  <div className="rounded-lg border border-accent/35 bg-accent/8 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <BrainCircuit className="size-4 text-accent" />
                        {t("coachTitle")}
                      </div>
                      <span className="rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent">
                        Pattern Seeker
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                      {t("coachText")}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {PATTERN_KEYS.map((p, index) => (
                      <div
                        key={p}
                        className="rounded-lg border border-border bg-bg/45 p-4 transition hover:border-border-strong"
                      >
                        <span className="font-mono text-xs text-fg-subtle">
                          0{index + 1}
                        </span>
                        <p className="mt-2 font-medium tracking-tight">
                          {t(`patterns.${p}`)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="rounded-lg border p-4"
                    style={{
                      borderColor: "oklch(74% 0.15 145 / 0.35)",
                      background: "oklch(74% 0.15 145 / 0.08)",
                    }}
                  >
                    <div
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: "var(--color-success)" }}
                    >
                      <Goal className="size-4" />
                      {t("goalTitle")}
                    </div>
                    <p className="mt-2 text-sm text-fg-muted">
                      {t("goalText")}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* THREE CARDS ------------------------------------------ */}
        <section className="border-y border-border/70 bg-bg-elevated/40 py-20 md:py-24">
          <div className="container grid gap-3 md:grid-cols-3">
            <Reveal>
              <BuilderCard
                icon={<BrainCircuit className="size-5" />}
                title={t("cards.patterns.title")}
                text={t("cards.patterns.text")}
              />
            </Reveal>
            <Reveal delay={120}>
              <BuilderCard
                icon={<TimerReset className="size-5" />}
                title={t("cards.pressure.title")}
                text={t("cards.pressure.text")}
              />
            </Reveal>
            <Reveal delay={240}>
              <BuilderCard
                icon={<LineChart className="size-5" />}
                title={t("cards.iteration.title")}
                text={t("cards.iteration.text")}
              />
            </Reveal>
          </div>
        </section>

        {/* CTA -------------------------------------------------- */}
        <section className="relative overflow-hidden py-28 md:py-36">
          <div
            aria-hidden
            className="hero-orb pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2"
          />
          <div className="container text-center">
            <Reveal>
              <p className="text-eyebrow">{t("ctaEyebrow")}</p>
              <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance md:text-5xl">
                {t("ctaTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-fg-muted">
                {t("ctaText")}
              </p>
              <Link
                href="/sign-in"
                className="btn-primary mt-9 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
              >
                {common("signIn")} <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <MarketingFooter
        productHeading={footer("productHeading")}
        resourcesHeading={footer("resourcesHeading")}
        companyHeading={footer("companyHeading")}
        tagline={footer("tagline")}
        rights={footer("rights")}
        product={footerCols.product}
        resources={footerCols.resources}
        company={footerCols.company}
      />
    </div>
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
    <article className="surface-card surface-card-hover surface-grain group h-full p-6">
      <span className="grid size-10 place-items-center rounded-full border border-accent/35 bg-accent/10 text-accent">
        {icon}
      </span>
      <h3 className="mt-6 font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{text}</p>
    </article>
  );
}
