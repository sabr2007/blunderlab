import {
  PatternTrendChart,
  type PatternTrendPoint,
} from "@/components/dashboard/pattern-trend-chart";
import { BlunderPatternBadge } from "@/components/review/blunder-pattern-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  BlunderCategory,
  City,
  GameReviewRow,
  Json,
} from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CalendarCheck, Flame, Target, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your BlunderLab progress and recent review patterns.",
};

type RecentReview = Pick<
  GameReviewRow,
  | "id"
  | "game_id"
  | "created_at"
  | "main_category"
  | "blunder_count"
  | "mistake_count"
  | "training_goal"
>;

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  display_name: string | null;
  score: number;
  reviewed_games: number;
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await supabase
    .from("profiles")
    .select("city,default_difficulty")
    .eq("id", user.id)
    .single();
  const city = profile.data?.city ?? "Other";
  const [
    reviewedCount,
    recentReviews,
    topWeakness,
    trend,
    streak,
    dailyStatus,
    cityRank,
  ] = await Promise.all([
    loadReviewedCount(user.id),
    loadRecentReviews(user.id),
    loadTopWeakness(user.id),
    loadTrend(user.id),
    loadStreak(user.id),
    loadDailyStatus(user.id),
    loadCityRank(user.id, city),
  ]);

  return (
    <main className="container py-6 md:py-8">
      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Progress cockpit
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Your chess thinking, week by week.
        </h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<CalendarCheck className="size-5 text-accent" />}
          label="Games reviewed"
          value={String(reviewedCount)}
          hint="Last 30 days"
        />
        <MetricCard
          icon={<Flame className="size-5 text-warning" />}
          label="Current streak"
          value={`${streak}d`}
          hint={streak > 0 ? "Keep the loop alive" : "Review a game to start"}
        />
        <MetricCard
          icon={<Target className="size-5 text-danger" />}
          label="Top weakness"
          value={topWeakness ?? "None yet"}
          hint="Most common pattern this week"
        />
        <MetricCard
          icon={<Trophy className="size-5 text-success" />}
          label="City rank"
          value={cityRank ? `#${cityRank.rank}` : "Unranked"}
          hint={`${city} improvers`}
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.9fr)]">
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Pattern trend</CardTitle>
              <CardDescription>
                Critical moments grouped into rolling 7-day windows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trend.some(
                (point) =>
                  point.blunders + point.mistakes + point.inaccuracies > 0,
              ) ? (
                <PatternTrendChart data={trend} />
              ) : (
                <EmptyState text="Play and review a few games. Your recurring patterns will surface here." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent reviews</CardTitle>
              <CardDescription>
                The fastest way back into your learning loop.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentReviews.length > 0 ? (
                <div className="grid gap-3">
                  {recentReviews.map((review) => (
                    <Link
                      key={review.id}
                      href={`/review/${review.game_id}`}
                      className="rounded-md border border-border bg-bg/40 p-4 transition hover:border-accent/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {formatDate(review.created_at)}
                          </p>
                          <p className="mt-1 text-sm text-fg-muted">
                            {review.training_goal ??
                              "Open the review to continue training."}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {review.main_category ? (
                            <BlunderPatternBadge
                              category={review.main_category}
                            />
                          ) : (
                            <Badge variant="success">Clean</Badge>
                          )}
                          <Badge variant="danger">
                            {review.blunder_count} blunders
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState text="No reviews yet. Finish a game and run your first AI Coach review." />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 xl:self-start">
          <Card className="border-success/30 bg-success/5">
            <CardHeader>
              <CardTitle>Daily Blunder</CardTitle>
              <CardDescription>
                One position per day from your own mistakes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-fg-muted">
                {dailyStatus === "completed"
                  ? "Solved today. Come back tomorrow for the next position."
                  : dailyStatus === "available"
                    ? "Today's position is ready."
                    : "Review at least one game with a mistake to unlock this."}
              </p>
              <Link
                href="/daily-blunder"
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-success px-4 text-sm font-medium text-bg transition hover:opacity-90"
              >
                Open daily puzzle
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                Top improvers in {city}, last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cityRank ? (
                <div className="rounded-md border border-border bg-bg/40 p-4">
                  <p className="text-sm text-fg-muted">Your current score</p>
                  <p className="mt-1 font-mono text-2xl">
                    {cityRank.score.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-fg-muted">
                    {cityRank.reviewed_games} reviewed games this week
                  </p>
                </div>
              ) : (
                <EmptyState text="Review 5 games this week to enter the city leaderboard." />
              )}
              <Link
                href="/leaderboard"
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium transition hover:bg-surface-elevated"
              >
                View leaderboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-fg-muted">{label}</p>
          {icon}
        </div>
        <p className="mt-3 truncate font-mono text-2xl">{value}</p>
        <p className="mt-1 text-xs text-fg-muted">{hint}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-border p-4 text-sm text-fg-muted">
      {text}
    </p>
  );
}

async function loadReviewedCount(userId: string) {
  const supabase = await getSupabaseServerClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const result = await supabase
    .from("game_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  return result.count ?? 0;
}

async function loadRecentReviews(userId: string): Promise<RecentReview[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("game_reviews")
    .select(
      "id,game_id,created_at,main_category,blunder_count,mistake_count,training_goal",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  return data ?? [];
}

async function loadTopWeakness(
  userId: string,
): Promise<BlunderCategory | null> {
  const supabase = await getSupabaseServerClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("game_reviews")
    .select("main_category")
    .eq("user_id", userId)
    .gte("created_at", since)
    .not("main_category", "is", null);

  const counts = new Map<BlunderCategory, number>();
  for (const row of data ?? []) {
    if (row.main_category) {
      counts.set(row.main_category, (counts.get(row.main_category) ?? 0) + 1);
    }
  }

  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

async function loadTrend(userId: string): Promise<PatternTrendPoint[]> {
  const supabase = await getSupabaseServerClient();
  const now = Date.now();
  const start = now - 28 * 24 * 60 * 60 * 1000;
  const { data } = await supabase
    .from("critical_moments")
    .select("severity,created_at")
    .eq("user_id", userId)
    .gte("created_at", new Date(start).toISOString());
  const buckets: PatternTrendPoint[] = Array.from(
    { length: 4 },
    (_, index) => ({
      label: `W${index + 1}`,
      blunders: 0,
      mistakes: 0,
      inaccuracies: 0,
    }),
  );

  for (const moment of data ?? []) {
    const offset = Math.floor(
      (new Date(moment.created_at).getTime() - start) /
        (7 * 24 * 60 * 60 * 1000),
    );
    const bucket = buckets[Math.min(Math.max(offset, 0), 3)];
    if (moment.severity === "blunder") bucket.blunders += 1;
    if (moment.severity === "mistake") bucket.mistakes += 1;
    if (moment.severity === "inaccuracy") bucket.inaccuracies += 1;
  }

  return buckets;
}

async function loadStreak(userId: string): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const [reviews, attempts] = await Promise.all([
    supabase
      .from("game_reviews")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
    supabase
      .from("daily_blunder_attempts")
      .select("completed_at")
      .eq("user_id", userId)
      .eq("success", true)
      .gte("completed_at", since),
  ]);

  const days = new Set<string>();
  for (const row of reviews.data ?? []) {
    days.add(row.created_at.slice(0, 10));
  }
  for (const row of attempts.data ?? []) {
    if (row.completed_at) days.add(row.completed_at.slice(0, 10));
  }

  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

async function loadDailyStatus(userId: string) {
  const supabase = await getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const attempt = await supabase
    .from("daily_blunder_attempts")
    .select("success")
    .eq("user_id", userId)
    .eq("attempt_date", today)
    .maybeSingle();

  if (attempt.data?.success) return "completed" as const;

  const moments = await supabase
    .from("critical_moments")
    .select("id")
    .eq("user_id", userId)
    .in("severity", ["mistake", "blunder"])
    .limit(1);

  return moments.data && moments.data.length > 0
    ? ("available" as const)
    : ("locked" as const);
}

async function loadCityRank(userId: string, city: City) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("leaderboard_snapshots")
    .select("snapshot")
    .eq("city", city)
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  const snapshot = parseLeaderboardSnapshot(data?.snapshot);
  return snapshot.find((entry) => entry.user_id === userId) ?? null;
}

function parseLeaderboardSnapshot(value: Json | undefined): LeaderboardEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isLeaderboardEntry);
}

function isLeaderboardEntry(value: Json): value is LeaderboardEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return (
    typeof value.rank === "number" &&
    typeof value.user_id === "string" &&
    typeof value.score === "number" &&
    typeof value.reviewed_games === "number"
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
