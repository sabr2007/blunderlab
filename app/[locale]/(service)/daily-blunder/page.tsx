import { getOrCreateTodaysBlunder } from "@/app/(service)/daily-blunder/actions";
import { DailyBlunderTrainer } from "@/components/daily-blunder/daily-blunder-trainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Blunder",
  description: "Solve one position per day from your own BlunderLab mistakes.",
};

export default async function DailyBlunderPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const payload = await getOrCreateTodaysBlunder(user.id);

  return (
    <main className="container py-6 md:py-8">
      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Daily Blunder
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          One old mistake. One better move.
        </h1>
      </header>

      {payload ? (
        <DailyBlunderTrainer payload={payload} />
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No Daily Blunder yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-fg-muted">
            <p>
              Daily Blunder unlocks after you have at least one reviewed mistake
              or blunder. Play a game, run review, then come back here.
            </p>
            <Link
              href="/play"
              className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-bg transition hover:opacity-90"
            >
              Play a game
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
