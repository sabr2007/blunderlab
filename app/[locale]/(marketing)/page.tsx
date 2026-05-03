import { ChessBoardWrapper } from "@/components/chess/chess-board-wrapper";
import { Reveal } from "@/components/common/reveal";
import { LaptopMockup } from "@/components/marketing/laptop-mockup";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { GlowyWavesHero } from "@/components/ui/glowy-waves-hero-shadcnui";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Crosshair,
  Goal,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

const FEATURED_PATTERN = "Tunnel Vision" as const;
const SECONDARY_PATTERN_KEYS = [
  "Hanging Piece",
  "Missed Tactic",
  "King Safety",
  "Greedy Move",
  "Time Panic",
  "Opening Drift",
  "Endgame Technique",
] as const;

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const common = await getTranslations("common");
  const patterns = await getTranslations("patterns");
  const patternLabels = await getTranslations("patternLabels");
  const proT = await getTranslations("proPage");
  const footer = await getTranslations("footer");
  const locale = await getLocale();
  const demoVideoSrc =
    locale === "ru"
      ? "/videos/blunderlab-demo-ru.mp4"
      : "/videos/blunderlab-demo-en.mp4";
  const tiers = [
    {
      name: proT("free.name"),
      price: proT("free.price"),
      features: proT.raw("free.features") as string[],
      highlight: false,
      ctaLabel: proT("freeCta"),
      ctaHref: "/sign-in",
    },
    {
      name: proT("pro.name"),
      price: proT("pro.price"),
      features: proT.raw("pro.features") as string[],
      highlight: true,
      ctaLabel: proT("proCta"),
      ctaHref: "/pro",
    },
    {
      name: proT("school.name"),
      price: proT("school.price"),
      features: proT.raw("school.features") as string[],
      highlight: false,
      ctaLabel: proT("schoolCta"),
      ctaHref: "/pro",
    },
  ];

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
        {/* HERO ------------------------------------------------------- */}
        <GlowyWavesHero
          copy={{
            pill: t("heroPill"),
            title: t("heroTitle"),
            titleAccent: t("heroTitle").includes("blunder")
              ? "blunder"
              : "ошибку",
            text: t("heroText"),
            primaryCta: common("startTraining"),
            primaryCtaHref: "/play",
            secondaryCta: t("watchDemo"),
            signals: [t("heroSignalA"), t("heroSignalB"), t("heroSignalC")],
          }}
        />

        {/* DEMO LAPTOP ----------------------------------------------- */}
        <section
          id="demo"
          aria-labelledby="demo-heading"
          className="relative scroll-mt-20 py-14 sm:py-20 md:py-24"
        >
          <div className="container">
            <Reveal className="mx-auto mb-8 max-w-2xl text-center md:mb-12">
              <p className="text-eyebrow">{t("demoEyebrow")}</p>
              <h2
                id="demo-heading"
                className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl md:text-4xl"
              >
                {t("demoTitle")}
              </h2>
              <p className="mt-4 text-sm text-fg-muted sm:text-base">
                {t("demoText")}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <LaptopMockup
                label={t("demoLabel")}
                caption={t("demoComing")}
                videoSrc={demoVideoSrc}
              />
            </Reveal>
          </div>
        </section>

        {/* PROBLEM --------------------------------------------------- */}
        <section
          aria-labelledby="problem-heading"
          className="relative border-y border-border/70 bg-bg-elevated/40 py-14 sm:py-20 md:py-24"
        >
          <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
            <Reveal>
              <p className="text-eyebrow">{t("problemEyebrow")}</p>
              <h2
                id="problem-heading"
                className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl md:text-4xl"
              >
                {t("problemTitle")}
              </h2>
            </Reveal>
            <Reveal delay={120} className="grid gap-4">
              <blockquote className="surface-card surface-grain p-6 text-lg italic leading-relaxed text-fg">
                <span className="select-none text-3xl leading-none text-accent">
                  “
                </span>
                {t("problemQuote")}
                <span className="select-none text-3xl leading-none text-accent">
                  ”
                </span>
              </blockquote>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="surface-card p-5">
                  <p className="text-eyebrow text-fg-subtle">
                    {t("engineLabel")}
                  </p>
                  <p className="mt-3 text-sm text-fg-muted">
                    {t("problemEngine")}
                  </p>
                </div>
                <div
                  className="surface-card p-5"
                  style={{
                    background:
                      "linear-gradient(180deg, oklch(74% 0.15 145 / 0.10), transparent)",
                    borderColor: "oklch(74% 0.15 145 / 0.30)",
                  }}
                >
                  <p
                    className="text-eyebrow"
                    style={{ color: "var(--color-success)" }}
                  >
                    BlunderLab
                  </p>
                  <p className="mt-3 text-sm text-fg-muted">
                    {t("problemBlunderLab")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* HOW IT WORKS --------------------------------------------- */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          className="scroll-mt-20 py-16 sm:py-24 md:py-32"
        >
          <div className="container">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-eyebrow">{t("howEyebrow")}</p>
              <h2
                id="how-heading"
                className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl md:text-5xl"
              >
                {t("howTitle")}
              </h2>
            </Reveal>

            <div className="relative mt-10 grid gap-4 sm:mt-14 md:grid-cols-2 lg:grid-cols-4">
              {/* connector line on desktop */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent lg:block"
              />
              <Reveal delay={0}>
                <Step
                  icon={<Swords className="size-5" />}
                  number="01"
                  title={t("stepPlayTitle")}
                  text={t("stepPlayText")}
                />
              </Reveal>
              <Reveal delay={80}>
                <Step
                  icon={<Crosshair className="size-5" />}
                  number="02"
                  title={t("stepReviewTitle")}
                  text={t("stepReviewText")}
                />
              </Reveal>
              <Reveal delay={160}>
                <Step
                  icon={<BrainCircuit className="size-5" />}
                  number="03"
                  title={t("stepPatternTitle")}
                  text={t("stepPatternText")}
                />
              </Reveal>
              <Reveal delay={240}>
                <Step
                  icon={<Goal className="size-5" />}
                  number="04"
                  title={t("stepTrainTitle")}
                  text={t("stepTrainText")}
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* PATTERN TAXONOMY ----------------------------------------- */}
        <section
          id="patterns"
          aria-labelledby="patterns-heading"
          className="relative scroll-mt-20 border-y border-border/70 bg-bg-elevated/40 py-16 sm:py-24 md:py-32"
        >
          <div className="container">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-eyebrow">{t("taxonomyEyebrow")}</p>
              <h2
                id="patterns-heading"
                className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl md:text-5xl"
              >
                {t("taxonomyTitle")}
              </h2>
              <p className="mt-4 text-sm text-fg-muted sm:text-base">
                {t("taxonomyText")}
              </p>
            </Reveal>

            <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:mt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.55fr)] lg:gap-10">
              <Reveal>
                <article
                  className="surface-card surface-grain relative h-full overflow-hidden p-7 md:p-9"
                  style={{
                    background:
                      "linear-gradient(170deg, oklch(78% 0.16 72 / 0.10) 0%, transparent 65%)",
                    borderColor: "oklch(78% 0.16 72 / 0.40)",
                  }}
                >
                  <div
                    aria-hidden
                    className="hero-orb pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-50"
                  />
                  <div className="relative">
                    <p className="text-eyebrow">
                      {t("taxonomyFeaturedEyebrow")}
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                      {patternLabels(FEATURED_PATTERN)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-fg">
                      {t("taxonomyFeaturedTagline")}
                    </p>
                    <p className="mt-5 text-sm leading-relaxed text-fg-muted">
                      {t("taxonomyFeaturedDeeper")}
                    </p>
                    <dl className="mt-7 grid gap-4 border-t border-border/60 pt-5 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-eyebrow text-fg-subtle">
                          {t("taxonomyFeaturedTrigger")}
                        </dt>
                        <dd className="mt-2 leading-relaxed text-fg-muted">
                          {t("taxonomyFeaturedTriggerText")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-eyebrow text-fg-subtle">
                          {t("taxonomyFeaturedFix")}
                        </dt>
                        <dd className="mt-2 leading-relaxed text-fg-muted">
                          {t("taxonomyFeaturedFixText")}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </Reveal>

              <Reveal delay={120}>
                <div className="flex h-full flex-col">
                  <p className="text-eyebrow text-fg-subtle">
                    {t("taxonomyMoreEyebrow")}
                  </p>
                  <ol className="mt-4 grid divide-y divide-border/70 border-y border-border/70">
                    {SECONDARY_PATTERN_KEYS.map((name, index) => (
                      <li
                        key={name}
                        className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 py-4 transition hover:bg-bg-elevated/30 sm:grid-cols-[auto_minmax(0,11rem)_minmax(0,1fr)] sm:gap-x-6"
                      >
                        <span className="font-mono text-xs text-fg-subtle">
                          {String(index + 2).padStart(2, "0")}
                        </span>
                        <h3 className="text-sm font-medium tracking-tight transition group-hover:text-accent sm:text-base">
                          {patternLabels(name)}
                        </h3>
                        <p className="col-start-2 text-sm leading-relaxed text-fg-muted sm:col-start-3">
                          {patterns(name)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>
            <p className="mt-10 text-center text-xs text-fg-subtle">
              {t("patternsHelper")}
            </p>
          </div>
        </section>

        {/* DASHBOARD + DAILY ----------------------------------------- */}
        <section className="py-16 sm:py-24 md:py-32">
          <div className="container grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <article className="surface-card surface-grain h-full p-7 md:p-9">
                <p className="text-eyebrow">{t("dashboardEyebrow")}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  {t("dashboardTitle")}
                </h2>
                <dl className="mt-9 grid grid-cols-2 gap-y-7 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border/60">
                  <PreviewStat
                    icon={<ChartNoAxesCombined />}
                    label={t("miniTopWeakness")}
                    value={patternLabels("Tunnel Vision")}
                  />
                  <PreviewStat
                    icon={<Sparkles />}
                    label={t("miniStreak")}
                    value="4d"
                    accent
                  />
                  <PreviewStat
                    icon={<Trophy />}
                    label={t("miniCityRank")}
                    value="#12"
                  />
                  <PreviewStat
                    icon={<Target />}
                    label={t("miniDaily")}
                    value={t("miniReady")}
                    accent
                  />
                </dl>
              </article>
            </Reveal>

            <Reveal delay={120}>
              <article className="surface-card surface-grain relative h-full overflow-hidden p-7 md:p-9">
                <div
                  aria-hidden
                  className="hero-orb pointer-events-none absolute -right-20 -top-20 h-80 w-80 opacity-60"
                />
                <span className="text-eyebrow">{t("miniDaily")}</span>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  {t("dailyTitle")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {t("dailyText")}
                </p>
                <div className="mt-7">
                  <MiniBoard />
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        {/* PRICING -------------------------------------------------- */}
        <section
          aria-labelledby="pricing-heading"
          className="border-t border-border/70 bg-bg-elevated/40 py-16 sm:py-24 md:py-32"
        >
          <div className="container">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
              <Reveal>
                <p className="text-eyebrow">{t("pricingEyebrow")}</p>
                <h2
                  id="pricing-heading"
                  className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl md:text-5xl"
                >
                  {t("pricingTitle")}
                </h2>
              </Reveal>
              <Link
                href="/pro"
                className="btn-ghost inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-accent"
              >
                {t("pricingLink")} <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier, index) => (
                <Reveal key={tier.name} delay={index * 80}>
                  <article
                    className={`surface-card surface-grain group relative h-full overflow-hidden p-6 transition ${
                      tier.highlight
                        ? "border-accent/55"
                        : "hover:border-border-strong"
                    }`}
                    style={
                      tier.highlight
                        ? {
                            background:
                              "linear-gradient(165deg, oklch(78% 0.16 72 / 0.10) 0%, transparent 60%)",
                            boxShadow:
                              "0 1px 0 oklch(100% 0 0 / 0.04) inset, 0 30px 60px oklch(0% 0 0 / 0.45)",
                          }
                        : undefined
                    }
                  >
                    {tier.highlight ? (
                      <span className="absolute right-5 top-5 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent">
                        {proT("mostPopular")}
                      </span>
                    ) : null}
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-semibold tracking-tight">
                        {tier.name}
                      </h3>
                    </div>
                    <p className="mt-4 font-mono text-3xl tracking-tight">
                      {tier.price}
                      {tier.name === "Pro" ? (
                        <span className="text-sm text-fg-subtle">/mo</span>
                      ) : null}
                    </p>
                    <ul className="mt-6 grid gap-2 text-sm text-fg-muted">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5">
                          <span className="grid size-4 place-items-center rounded-full border border-accent/40 bg-accent/10">
                            <span className="size-1.5 rounded-full bg-accent" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.ctaHref}
                      className={`mt-7 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md text-sm font-medium transition ${
                        tier.highlight
                          ? "bg-accent text-bg hover:opacity-90"
                          : "border border-border text-fg-muted hover:border-border-strong hover:text-fg"
                      }`}
                    >
                      {tier.ctaLabel}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA ------------------------------------------------ */}
        <section className="relative overflow-hidden py-20 sm:py-28 md:py-36">
          <div
            aria-hidden
            className="hero-orb pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2"
          />
          <div className="container text-center">
            <Reveal>
              <h2 className="text-display mx-auto max-w-3xl font-semibold text-balance">
                {t("finalTitle")}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-5 max-w-2xl text-sm text-fg-muted sm:text-base">
                {t("finalText")}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/sign-in?next=/play"
                  className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                >
                  {common("startTraining")} <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/pro"
                  className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                >
                  {common("pro")}
                </Link>
              </div>
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
    <article className="surface-card surface-card-hover surface-grain relative h-full p-6">
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-full border border-accent/35 bg-accent/10 text-accent">
          {icon}
        </span>
        <span className="font-mono text-xs text-fg-subtle">{number}</span>
      </div>
      <h3 className="mt-6 font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{text}</p>
    </article>
  );
}

function PreviewStat({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 flex flex-col gap-2 px-0 sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <span
        className={`inline-flex size-8 items-center justify-center ${
          accent ? "text-accent" : "text-fg-muted"
        }`}
      >
        {icon}
      </span>
      <dd
        className={`text-balance font-mono text-2xl tracking-tight ${
          accent ? "text-accent" : ""
        } max-w-full break-words leading-tight`}
      >
        {value}
      </dd>
      <dt className="break-words text-xs uppercase tracking-[0.16em] text-fg-subtle leading-tight">
        {label}
      </dt>
    </div>
  );
}

function MiniBoard() {
  const dailyBlunderFen =
    "r2qk2r/ppp2ppp/2n1bn2/1N1pp3/2B1P3/5N2/PPPP1PPP/R1BQ1RK1 w kq - 0 8";

  return (
    <ChessBoardWrapper
      fen={dailyBlunderFen}
      disabled
      bestMove={{ from: "b5", to: "c7" }}
      className="max-w-none rounded-lg border-border-strong/70 p-2 shadow-board"
    />
  );
}
