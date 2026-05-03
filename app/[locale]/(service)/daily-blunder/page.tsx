import { getOrCreateTodaysBlunder } from "@/app/(service)/daily-blunder/actions";
import { DailyBlunderTrainer } from "@/components/daily-blunder/daily-blunder-trainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { isRealUser } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Daily Blunder",
  description: "Solve one position per day from your own BlunderLab mistakes.",
};

export default async function DailyBlunderPage() {
  const t = await getTranslations("dailyPage");
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    return (
      <main className="container py-6 md:py-8">
        <header className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
            {t("title")}
          </h1>
        </header>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t("guestTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-fg-muted">
            <p>{t("guestText")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sign-in?next=/daily-blunder"
                className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-bg transition hover:opacity-90"
              >
                {t("guestSignIn")}
              </Link>
              <Link
                href="/play"
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-bg px-4 text-sm font-medium text-fg transition hover:bg-surface"
              >
                {t("guestPlay")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const payload = await getOrCreateTodaysBlunder(user.id);

  return (
    <main className="container py-6 md:py-8">
      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          {t("title")}
        </h1>
      </header>

      {payload ? (
        <DailyBlunderTrainer payload={payload} />
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t("emptyTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-fg-muted">
            <p>{t("emptyText")}</p>
            <Link
              href="/play"
              className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-bg transition hover:opacity-90"
            >
              {t("playGame")}
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
