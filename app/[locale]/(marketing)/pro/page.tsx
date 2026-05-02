import { Reveal } from "@/components/common/reveal";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { WaitlistForm } from "@/components/pro/waitlist-form";
import { Check, Crown, Minus, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Pro",
  description: "BlunderLab Pro tiers and waitlist.",
};

export default async function ProPage() {
  const t = await getTranslations("pro");
  const proT = await getTranslations("proPage");
  const common = await getTranslations("common");
  const footer = await getTranslations("footer");
  const tiers = [
    {
      name: proT("free.name"),
      price: proT("free.price"),
      suffix: proT("free.suffix"),
      description: proT("free.description"),
      features: proT.raw("free.features") as string[],
      highlighted: false,
    },
    {
      name: proT("pro.name"),
      price: proT("pro.price"),
      suffix: proT("pro.suffix"),
      description: proT("pro.description"),
      features: proT.raw("pro.features") as string[],
      highlighted: true,
    },
    {
      name: proT("school.name"),
      price: proT("school.price"),
      suffix: proT("school.suffix"),
      description: proT("school.description"),
      features: proT.raw("school.features") as string[],
      highlighted: false,
    },
  ];
  const features = [
    [proT("features.play"), true, true, true],
    [
      proT("features.reviewsPerDay"),
      "3",
      proT("features.unlimited"),
      proT("features.unlimited"),
    ],
    [
      proT("features.coach"),
      proT("features.basic"),
      proT("features.deep"),
      proT("features.deep"),
    ],
    [
      proT("features.history"),
      proT("features.days7"),
      proT("features.full"),
      proT("features.full"),
    ],
    [proT("features.daily"), true, true, true],
    [proT("features.goal"), true, true, true],
    [proT("features.pattern"), false, true, true],
    [proT("features.builder"), false, true, true],
    [proT("features.weekly"), false, true, true],
    [proT("features.coachDashboard"), false, false, true],
  ] as const;

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
      <MarketingNav
        signInLabel={common("signIn")}
        ctaLabel={common("startTraining")}
      />

      <main>
        {/* HERO ---------------------------------------------- */}
        <section className="relative isolate overflow-hidden pb-12 pt-16 md:pb-16 md:pt-24">
          <div
            aria-hidden
            className="hero-orb pointer-events-none absolute left-1/2 top-[-12%] -z-10 h-[560px] w-[820px] -translate-x-1/2"
          />
          <div className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-25" />

          <div className="container">
            <Reveal className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/80 px-3.5 py-1.5 text-xs text-fg-muted backdrop-blur">
                <Crown className="size-3.5 text-accent" /> {t("eyebrow")}
              </span>
              <h1 className="text-display mt-6 font-semibold text-balance">
                {t("title")}
              </h1>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-fg-muted">
                {t("text")}
              </p>
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-5xl gap-3 lg:grid-cols-3">
              {tiers.map((tier, index) => (
                <Reveal key={tier.name} delay={index * 80}>
                  <article
                    className={`surface-card surface-grain relative h-full overflow-hidden p-7 transition ${
                      tier.highlighted
                        ? "border-accent/55"
                        : "hover:border-border-strong"
                    }`}
                    style={
                      tier.highlighted
                        ? {
                            background:
                              "linear-gradient(170deg, oklch(78% 0.16 72 / 0.10) 0%, transparent 60%)",
                            boxShadow:
                              "0 1px 0 oklch(100% 0 0 / 0.05) inset, 0 30px 60px oklch(0% 0 0 / 0.45)",
                          }
                        : undefined
                    }
                  >
                    {tier.highlighted ? (
                      <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent">
                        <Sparkles className="size-3" />
                        {proT("mostPopular")}
                      </span>
                    ) : null}
                    <h3 className="text-lg font-semibold tracking-tight">
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-sm text-fg-muted">
                      {tier.description}
                    </p>
                    <p className="mt-6 font-mono text-4xl tracking-tight">
                      {tier.price}
                    </p>
                    <p className="text-xs text-fg-subtle">{tier.suffix}</p>
                    <ul className="mt-6 grid gap-2.5 text-sm text-fg-muted">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10">
                            <Check className="size-2.5 text-accent" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* WAITLIST ----------------------------------------- */}
        <section className="py-16 md:py-20">
          <div className="container max-w-3xl">
            <Reveal>
              <article
                className="surface-card surface-grain p-7 md:p-9"
                style={{
                  borderColor: "oklch(78% 0.16 72 / 0.4)",
                  background:
                    "linear-gradient(180deg, oklch(78% 0.16 72 / 0.06), transparent)",
                }}
              >
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {t("join")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {proT("paymentsNote")}
                </p>
                <div className="mt-6">
                  <WaitlistForm />
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        {/* COMPARISON --------------------------------------- */}
        <section className="border-t border-border/70 bg-bg-elevated/40 py-24 md:py-28">
          <div className="container">
            <Reveal className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-eyebrow">{proT("comparisonEyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                {t("comparison")}
              </h2>
              <p className="mt-3 text-sm text-fg-muted">
                {proT("comparisonText")}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="surface-card surface-grain overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-6 py-4 font-medium text-fg-subtle">
                        {proT("feature")}
                      </th>
                      <th className="px-4 py-4 font-medium">Free</th>
                      <th className="px-4 py-4 font-medium text-accent">Pro</th>
                      <th className="px-4 py-4 font-medium">School</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map(([feature, free, pro, school], i) => (
                      <tr
                        key={String(feature)}
                        className={`border-b border-border/60 transition hover:bg-bg-elevated/40 ${
                          i % 2 === 0 ? "" : "bg-bg/30"
                        }`}
                      >
                        <td className="px-6 py-4 text-fg-muted">{feature}</td>
                        <Cell value={free} />
                        <Cell value={pro} accent />
                        <Cell value={school} />
                      </tr>
                    ))}
                  </tbody>
                </table>
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

function Cell({
  value,
  accent,
}: {
  value: boolean | string;
  accent?: boolean;
}) {
  if (value === true) {
    return (
      <td className="px-4 py-4">
        <span
          className={`grid size-5 place-items-center rounded-full border ${
            accent
              ? "border-accent/40 bg-accent/15 text-accent"
              : "border-success/30 bg-success/10 text-success"
          }`}
        >
          <Check className="size-3" />
        </span>
      </td>
    );
  }

  if (value === false) {
    return (
      <td className="px-4 py-4">
        <Minus className="size-4 text-fg-subtle" />
      </td>
    );
  }

  return <td className="px-4 py-4 text-fg">{value}</td>;
}
