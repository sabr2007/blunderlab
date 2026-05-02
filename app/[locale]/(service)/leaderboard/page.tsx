import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { City, Json } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top BlunderLab improvers by city.",
};

const CITIES: City[] = ["Almaty", "Astana", "Shymkent", "Other"];

type PageProps = {
  searchParams?: Promise<{ city?: string }>;
};

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  display_name: string | null;
  score: number;
  reviewed_games: number;
  blunders_last_7: number;
  blunders_prior_7: number;
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await supabase
    .from("profiles")
    .select("city")
    .eq("id", user.id)
    .single();
  const defaultCity = profile.data?.city ?? "Other";
  const requestedCity = CITIES.includes(params?.city as City)
    ? (params?.city as City)
    : defaultCity;
  const latest = await supabase
    .from("leaderboard_snapshots")
    .select("snapshot,period_start,period_end,created_at")
    .eq("city", requestedCity)
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  const entries = parseSnapshot(latest.data?.snapshot);
  const ownEntry = entries.find((entry) => entry.user_id === user.id);
  const isStale = latest.data
    ? Date.now() - new Date(latest.data.created_at).getTime() >
      25 * 60 * 60 * 1000
    : false;

  return (
    <main className="container py-6 md:py-8">
      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          City leaderboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Top improvers, not top ratings.
        </h1>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {CITIES.map((city) => (
          <Link
            key={city}
            href={`/leaderboard?city=${city}`}
            className={`rounded-md border px-3 py-2 text-sm transition ${
              city === requestedCity
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface text-fg-muted hover:text-fg"
            }`}
          >
            {city}
          </Link>
        ))}
      </div>

      {isStale ? (
        <p className="mb-5 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          Leaderboard is updating. The latest snapshot is older than 25 hours.
        </p>
      ) : null}

      {!ownEntry ? (
        <p className="mb-5 rounded-md border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
          Review 5 games this week to enter the {requestedCity} leaderboard.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{requestedCity} improvers</CardTitle>
          <CardDescription>
            {latest.data
              ? `${latest.data.period_start} → ${latest.data.period_end}`
              : "No snapshot yet. Run the cron job to seed the board."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="grid gap-3">
              {entries.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`grid gap-3 rounded-md border p-4 md:grid-cols-[56px_minmax(0,1fr)_auto] md:items-center ${
                    entry.user_id === user.id
                      ? "border-accent bg-accent/10"
                      : "border-border bg-bg/40"
                  }`}
                >
                  <div className="font-mono text-2xl">#{entry.rank}</div>
                  <div>
                    <p className="font-medium">
                      {entry.display_name ?? "BlunderLab player"}
                    </p>
                    <p className="mt-1 text-sm text-fg-muted">
                      {entry.blunders_prior_7} → {entry.blunders_last_7}{" "}
                      blunders across comparison windows
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Badge variant={entry.score <= 0 ? "success" : "warning"}>
                      {entry.score <= 0 ? "" : "+"}
                      {entry.score.toFixed(2)}
                    </Badge>
                    <Badge variant="default">
                      {entry.reviewed_games} reviews
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-border p-4 text-sm text-fg-muted">
              No eligible players yet. The board needs users with at least 5
              reviewed games in the last 7 days.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function parseSnapshot(value: Json | undefined): LeaderboardEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isEntry);
}

function isEntry(value: Json): value is LeaderboardEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return (
    typeof value.rank === "number" &&
    typeof value.user_id === "string" &&
    typeof value.score === "number" &&
    typeof value.reviewed_games === "number" &&
    typeof value.blunders_last_7 === "number" &&
    typeof value.blunders_prior_7 === "number"
  );
}
