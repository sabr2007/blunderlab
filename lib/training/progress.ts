import type { BlunderCategory } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ActiveTrainingGoal = {
  id: string;
  gameId: string;
  text: string;
  category: BlunderCategory | null;
  createdAt: string;
};

export type WeeklyWeakness = {
  category: BlunderCategory | null;
  currentPerGame: number | null;
  previousPerGame: number | null;
  currentGames: number;
  previousGames: number;
  direction: "down" | "up" | "same" | "insufficient";
};

export type IdentityLabel =
  | "Newcomer"
  | "Blunder Hunter"
  | "Pattern Seeker"
  | "Calm Defender";

export type IdentityLabelResult = {
  label: IdentityLabel;
  description: string;
};

type ReviewPatternRow = {
  main_category: BlunderCategory | null;
  created_at: string;
};

export async function loadActiveTrainingGoal(
  goalId?: string,
): Promise<ActiveTrainingGoal | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  if (goalId) {
    const { data } = await supabase
      .from("game_reviews")
      .select("id,game_id,training_goal,main_category,created_at")
      .eq("user_id", user.id)
      .eq("id", goalId)
      .not("training_goal", "is", null)
      .maybeSingle();

    const explicitGoal = toActiveGoal(data);
    if (explicitGoal) {
      return explicitGoal;
    }
  }

  const { data } = await supabase
    .from("game_reviews")
    .select("id,game_id,training_goal,main_category,created_at")
    .eq("user_id", user.id)
    .not("training_goal", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return toActiveGoal(data);
}

export async function loadWeeklyWeakness(
  userId: string,
): Promise<WeeklyWeakness> {
  const supabase = await getSupabaseServerClient();
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const currentStart = new Date(now - sevenDays);
  const previousStart = new Date(now - 2 * sevenDays);

  const { data } = await supabase
    .from("game_reviews")
    .select("main_category,created_at")
    .eq("user_id", userId)
    .gte("created_at", previousStart.toISOString())
    .not("main_category", "is", null);

  const rows = (data ?? []) as ReviewPatternRow[];
  const current = rows.filter(
    (row) => new Date(row.created_at).getTime() >= currentStart.getTime(),
  );
  const previous = rows.filter(
    (row) => new Date(row.created_at).getTime() < currentStart.getTime(),
  );

  const category = topCategory(current);
  if (!category || current.length < 2 || previous.length < 2) {
    return {
      category,
      currentPerGame: null,
      previousPerGame: null,
      currentGames: current.length,
      previousGames: previous.length,
      direction: "insufficient",
    };
  }

  const currentPerGame = countCategory(current, category) / current.length;
  const previousPerGame = countCategory(previous, category) / previous.length;
  const delta = currentPerGame - previousPerGame;

  return {
    category,
    currentPerGame,
    previousPerGame,
    currentGames: current.length,
    previousGames: previous.length,
    direction: Math.abs(delta) < 0.05 ? "same" : delta < 0 ? "down" : "up",
  };
}

export async function loadIdentityLabel(
  userId: string,
): Promise<IdentityLabelResult> {
  const supabase = await getSupabaseServerClient();
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const reviewed = await supabase
    .from("game_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since30);

  if ((reviewed.count ?? 0) >= 20) {
    return {
      label: "Blunder Hunter",
      description: "You are building the review habit through volume.",
    };
  }

  const weekly = await loadWeeklyWeakness(userId);
  if (weekly.direction === "down" && weekly.category) {
    return {
      label: "Pattern Seeker",
      description: `You are reducing ${weekly.category} over time.`,
    };
  }

  const { data } = await supabase
    .from("critical_moments")
    .select("category")
    .eq("user_id", userId)
    .gte("created_at", since30);

  const moments = data ?? [];
  const riskyCount = moments.filter(
    (moment) =>
      moment.category === "Time Panic" || moment.category === "Tunnel Vision",
  ).length;

  if (moments.length >= 5 && riskyCount / moments.length < 0.1) {
    return {
      label: "Calm Defender",
      description: "You rarely lose control to panic or tunnel vision.",
    };
  }

  return {
    label: "Newcomer",
    description: "Review a few games to unlock a stronger chess identity.",
  };
}

function toActiveGoal(
  row:
    | {
        id: string;
        game_id: string;
        training_goal: string | null;
        main_category: BlunderCategory | null;
        created_at: string;
      }
    | null
    | undefined,
): ActiveTrainingGoal | null {
  if (!row?.training_goal) {
    return null;
  }

  return {
    id: row.id,
    gameId: row.game_id,
    text: row.training_goal,
    category: row.main_category,
    createdAt: row.created_at,
  };
}

function topCategory(rows: ReviewPatternRow[]): BlunderCategory | null {
  const counts = new Map<BlunderCategory, number>();
  for (const row of rows) {
    if (!row.main_category) {
      continue;
    }

    counts.set(row.main_category, (counts.get(row.main_category) ?? 0) + 1);
  }

  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function countCategory(rows: ReviewPatternRow[], category: BlunderCategory) {
  return rows.filter((row) => row.main_category === category).length;
}
