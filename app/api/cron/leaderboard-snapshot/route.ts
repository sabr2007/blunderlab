import type { City, GameReviewRow, Json } from "@/lib/supabase/database.types";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const CITIES: City[] = ["Almaty", "Astana", "Shymkent", "Other"];

type ProfileForSnapshot = {
  id: string;
  display_name: string | null;
  city: City;
};

type SnapshotEntry = {
  rank: number;
  user_id: string;
  display_name: string | null;
  score: number;
  reviewed_games: number;
  blunders_last_7: number;
  blunders_prior_7: number;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret) {
    return new Response("CRON_SECRET is not configured", { status: 500 });
  }

  if (authorization !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = getSupabaseServiceRoleClient();
  const periodEnd = startOfUtcDay(new Date());
  const periodStart = addUtcDays(periodEnd, -7);
  const priorStart = addUtcDays(periodEnd, -14);
  const [profilesResult, reviewsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,display_name,city")
      .is("deleted_at", null),
    supabase
      .from("game_reviews")
      .select("user_id,created_at,blunder_count")
      .gte("created_at", priorStart.toISOString())
      .lt("created_at", periodEnd.toISOString()),
  ]);

  if (profilesResult.error) {
    return NextResponse.json(
      { error: profilesResult.error.message },
      { status: 500 },
    );
  }

  if (reviewsResult.error) {
    return NextResponse.json(
      { error: reviewsResult.error.message },
      { status: 500 },
    );
  }

  const profiles = (profilesResult.data ?? []) as ProfileForSnapshot[];
  const reviews = reviewsResult.data ?? [];
  const snapshots = buildSnapshots({
    profiles,
    reviews,
    priorStart,
    periodStart,
    periodEnd,
  });

  const rows = CITIES.map((city) => ({
    city,
    period_start: toDateString(periodStart),
    period_end: toDateString(periodEnd),
    snapshot: snapshots[city] as unknown as Json,
  }));

  const upsert = await supabase
    .from("leaderboard_snapshots")
    .upsert(rows, { onConflict: "city,period_start,period_end" });

  if (upsert.error) {
    return NextResponse.json({ error: upsert.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    period_start: toDateString(periodStart),
    period_end: toDateString(periodEnd),
    rows: rows.length,
  });
}

function buildSnapshots({
  profiles,
  reviews,
  periodStart,
  priorStart,
}: {
  profiles: ProfileForSnapshot[];
  reviews: Array<
    Pick<GameReviewRow, "user_id" | "created_at" | "blunder_count">
  >;
  priorStart: Date;
  periodStart: Date;
  periodEnd: Date;
}): Record<City, SnapshotEntry[]> {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const stats = new Map<
    string,
    {
      lastGames: number;
      lastBlunders: number;
      priorGames: number;
      priorBlunders: number;
    }
  >();

  for (const review of reviews) {
    if (!profileById.has(review.user_id)) continue;
    const createdAt = new Date(review.created_at);
    const current = stats.get(review.user_id) ?? {
      lastGames: 0,
      lastBlunders: 0,
      priorGames: 0,
      priorBlunders: 0,
    };

    if (createdAt >= periodStart) {
      current.lastGames += 1;
      current.lastBlunders += review.blunder_count;
    } else if (createdAt >= priorStart) {
      current.priorGames += 1;
      current.priorBlunders += review.blunder_count;
    }

    stats.set(review.user_id, current);
  }

  const byCity: Record<City, SnapshotEntry[]> = {
    Almaty: [],
    Astana: [],
    Shymkent: [],
    Other: [],
  };

  for (const [userId, stat] of stats) {
    const profile = profileById.get(userId);
    if (!profile || stat.lastGames < 5) continue;

    const lastAvg = stat.lastBlunders / stat.lastGames;
    const priorAvg =
      stat.priorGames > 0 ? stat.priorBlunders / stat.priorGames : lastAvg;
    const score = lastAvg - priorAvg;

    byCity[profile.city].push({
      rank: 0,
      user_id: userId,
      display_name: profile.display_name,
      score,
      reviewed_games: stat.lastGames,
      blunders_last_7: stat.lastBlunders,
      blunders_prior_7: stat.priorBlunders,
    });
  }

  for (const city of CITIES) {
    byCity[city] = byCity[city]
      .sort(
        (a, b) =>
          a.score - b.score ||
          b.reviewed_games - a.reviewed_games ||
          a.user_id.localeCompare(b.user_id),
      )
      .slice(0, 10)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  return byCity;
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}
