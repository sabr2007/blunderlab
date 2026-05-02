import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { WaitlistForm } from "@/components/pro/waitlist-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Check, Minus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Pro",
  description: "BlunderLab Pro tiers and waitlist.",
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    description: "For the first insight loop.",
    features: ["3 reviews/day", "Classic Game", "Daily Blunder"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    description: "For players who want focused training modes.",
    features: ["Unlimited reviews", "Pattern Drill", "Deep Review"],
    highlighted: true,
  },
  {
    name: "School",
    price: "Custom",
    description: "For clubs, classes, and mentors.",
    features: ["Student dashboard", "Class leaderboard", "Coach view"],
    highlighted: false,
  },
] as const;

const FEATURES = [
  ["Play vs Stockfish", true, true, true],
  ["Game Reviews / day", "3", "Unlimited", "Unlimited"],
  ["AI Coach explanations", "Basic", "Deep", "Deep"],
  ["Pattern history", "7 days", "Full", "Full"],
  ["Daily Blunder", true, true, true],
  ["Goal Focus mode", true, true, true],
  ["Pattern Drill mode", false, true, true],
  ["Builder Sprint mode", false, true, true],
  ["Weekly training plan", false, true, true],
  ["Coach dashboard", false, false, true],
] as const;

export default async function ProPage() {
  const t = await getTranslations("pro");
  const common = await getTranslations("common");

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-20" />
      <header className="container flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
            ◇
          </span>
          BlunderLab
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <LocaleSwitcher compact />
          <Link href="/sign-in" className="text-fg-muted hover:text-fg">
            {common("signIn")}
          </Link>
          <Link
            href="/play"
            className="rounded-md bg-accent px-3.5 py-2 font-medium text-bg transition hover:opacity-90"
          >
            {common("startTraining")}
          </Link>
        </nav>
      </header>

      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
            {t("text")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.highlighted ? "border-accent bg-accent/5" : undefined
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{tier.name}</CardTitle>
                  {tier.highlighted ? (
                    <Badge variant="accent">Most popular</Badge>
                  ) : null}
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="font-mono text-4xl">
                  {tier.price}
                  {tier.name === "Pro" ? (
                    <span className="text-sm text-fg-muted">/mo</span>
                  ) : null}
                </p>
                <ul className="grid gap-2 text-sm text-fg-muted">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle>{t("join")}</CardTitle>
            <CardDescription>
              Payments are not live in the submission prototype. This records
              upgrade intent for deeper training modes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WaitlistForm />
          </CardContent>
        </Card>

        <Card className="mt-6 overflow-hidden">
          <CardHeader>
            <CardTitle>{t("comparison")}</CardTitle>
            <CardDescription>
              Pro is framed around learning depth, not cosmetic board changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-4 font-medium text-fg-muted">
                    Feature
                  </th>
                  <th className="px-4 py-3 font-medium">Free</th>
                  <th className="px-4 py-3 font-medium text-accent">Pro</th>
                  <th className="px-4 py-3 font-medium">School</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map(([feature, free, pro, school]) => (
                  <tr key={feature} className="border-b border-border/70">
                    <td className="py-3 pr-4 text-fg-muted">{feature}</td>
                    <Cell value={free} />
                    <Cell value={pro} accent />
                    <Cell value={school} />
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Cell({
  value,
  accent,
}: { value: boolean | string; accent?: boolean }) {
  if (value === true) {
    return (
      <td className="px-4 py-3">
        <Check
          className={`size-4 ${accent ? "text-accent" : "text-success"}`}
        />
      </td>
    );
  }

  if (value === false) {
    return (
      <td className="px-4 py-3">
        <Minus className="size-4 text-fg-muted" />
      </td>
    );
  }

  return <td className="px-4 py-3">{value}</td>;
}
