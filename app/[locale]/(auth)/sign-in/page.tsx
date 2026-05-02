import { SignInForm } from "@/components/auth/sign-in-form";
import { BrandLogo } from "@/components/common/brand-logo";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Link } from "@/i18n/navigation";
import { isLocale, withLocalePrefix } from "@/i18n/routing";
import { getSafeNextPath } from "@/lib/auth/session";
import { ArrowLeft, Goal, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to BlunderLab with Google or an email magic link.",
};

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function SignInPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const query = await searchParams;
  const t = await getTranslations("auth");
  const common = await getTranslations("common");
  const landing = await getTranslations("landing");

  const nextPath = withLocalePrefix(
    getSafeNextPath(query?.next, withLocalePrefix("/dashboard", locale)),
    locale,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
      <div
        aria-hidden
        className="hero-orb pointer-events-none absolute left-[-10%] top-[10%] -z-10 h-[700px] w-[700px]"
      />
      <div className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-30" />

      <div className="container flex min-h-screen flex-col py-6">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="BlunderLab"
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-fg-muted transition hover:text-fg sm:min-h-0 sm:px-0"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{common("backToLanding")}</span>
            <BrandLogo
              variant="horizontal"
              priority
              className="ml-1 hidden h-6 w-auto sm:block"
            />
          </Link>
          <div className="flex items-center gap-3">
            <LocaleSwitcher compact />
            <Link
              href="/play"
              className="inline-flex min-h-11 items-center rounded-md px-2 text-sm text-fg-muted transition hover:text-fg sm:min-h-0 sm:px-0"
            >
              {t("playFirst")}
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-20 lg:py-20">
          {/* editorial side ----------------------------------------- */}
          <section className="hidden flex-col gap-8 lg:flex">
            <Link href="/" aria-label="BlunderLab" className="inline-flex">
              <BrandLogo variant="full" className="h-24 w-24" />
            </Link>
            <div className="max-w-lg">
              <p className="text-eyebrow">Welcome back</p>
              <h2 className="mt-3 text-display font-semibold text-balance">
                Your blunders.{" "}
                <span className="text-amber-emphasis">A clearer plan.</span>
              </h2>
              <p className="mt-5 text-pretty text-fg-muted">
                Sign in to keep your reviews, dashboards, and Daily Blunder
                history. The coach picks up where you left off.
              </p>
            </div>
            <ul className="grid gap-3 text-sm text-fg-muted">
              <Bullet icon={<Sparkles className="size-3.5" />}>
                {landing("heroSignalA")}
              </Bullet>
              <Bullet icon={<Target className="size-3.5" />}>
                {landing("heroSignalB")}
              </Bullet>
              <Bullet icon={<Goal className="size-3.5" />}>
                {landing("heroSignalC")}
              </Bullet>
            </ul>
          </section>

          {/* form side --------------------------------------------- */}
          <section className="mx-auto flex w-full justify-center lg:mx-0 lg:justify-end">
            <div className="w-full max-w-md">
              <div className="lg:hidden">
                <BrandLogo variant="full" className="h-16 w-16" />
              </div>
              <div className="mt-4 lg:mt-0">
                <SignInForm nextPath={nextPath} error={query?.error ?? null} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Bullet({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="inline-flex items-center gap-2">
      <span className="grid size-6 place-items-center rounded-full border border-accent/35 bg-accent/10 text-accent">
        {icon}
      </span>
      {children}
    </li>
  );
}
