import { SignInForm } from "@/components/auth/sign-in-form";
import { Link } from "@/i18n/navigation";
import { isLocale, withLocalePrefix } from "@/i18n/routing";
import { getSafeNextPath } from "@/lib/auth/session";
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
  const nextPath = withLocalePrefix(
    getSafeNextPath(query?.next, withLocalePrefix("/dashboard", locale)),
    locale,
  );

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-20" />
      <div className="container flex min-h-screen flex-col py-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
              ◇
            </span>
            BlunderLab
          </Link>
          <Link
            href="/play"
            className="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            {t("playFirst")}
          </Link>
        </header>
        <section className="grid flex-1 place-items-center py-10">
          <SignInForm nextPath={nextPath} error={query?.error ?? null} />
        </section>
      </div>
    </main>
  );
}
