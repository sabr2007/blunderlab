import type { CoachLocale } from "@/lib/coach/types";
import type {
  BlunderCategory,
  GameReviewRow,
} from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  loadActiveTrainingGoal,
  loadIdentityLabel,
  loadWeeklyWeakness,
} from "@/lib/training/progress";

export type CoachUserContext = {
  displayName: string;
  city: string | null;
  defaultDifficulty: string;
  reviewedCount30d: number;
  streak: number;
  topPattern: BlunderCategory | null;
  weeklyDirection: "down" | "up" | "same" | "insufficient";
  weeklyCurrentPerGame: number | null;
  weeklyPreviousPerGame: number | null;
  identity: string;
  identityDescription: string;
  activeGoal: string | null;
  recentReviews: ReadonlyArray<{
    date: string;
    pattern: string | null;
    blunders: number;
    mistakes: number;
    goal: string | null;
  }>;
};

type RecentReviewRow = Pick<
  GameReviewRow,
  | "created_at"
  | "main_category"
  | "blunder_count"
  | "mistake_count"
  | "training_goal"
>;

function isoDay(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export async function loadCoachUserContext(
  userId: string,
): Promise<CoachUserContext> {
  const supabase = await getSupabaseServerClient();

  const profileResult = await supabase
    .from("profiles")
    .select("display_name,city,default_difficulty")
    .eq("id", userId)
    .maybeSingle();
  const profile = profileResult.data;

  const since30d = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    reviewedCountResult,
    recentReviewsResult,
    streakResult,
    weeklyWeakness,
    identity,
    goal,
  ] = await Promise.all([
    supabase
      .from("game_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since30d),
    supabase
      .from("game_reviews")
      .select(
        "created_at,main_category,blunder_count,mistake_count,training_goal",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    loadStreakDays(userId),
    loadWeeklyWeakness(userId),
    loadIdentityLabel(userId),
    loadActiveTrainingGoal(),
  ]);

  const recentRows = (recentReviewsResult.data ?? []) as RecentReviewRow[];

  return {
    displayName: profile?.display_name ?? "BlunderLab player",
    city: profile?.city ?? null,
    defaultDifficulty: profile?.default_difficulty ?? "beginner",
    reviewedCount30d: reviewedCountResult.count ?? 0,
    streak: streakResult,
    topPattern: weeklyWeakness.category,
    weeklyDirection: weeklyWeakness.direction,
    weeklyCurrentPerGame: weeklyWeakness.currentPerGame,
    weeklyPreviousPerGame: weeklyWeakness.previousPerGame,
    identity: identity.label,
    identityDescription: identity.description,
    activeGoal: goal?.text ?? null,
    recentReviews: recentRows.map((row) => ({
      date: isoDay(row.created_at),
      pattern: row.main_category,
      blunders: row.blunder_count,
      mistakes: row.mistake_count,
      goal: row.training_goal,
    })),
  };
}

async function loadStreakDays(userId: string): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [reviewsResult, attemptsResult] = await Promise.all([
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
  for (const row of reviewsResult.data ?? []) {
    days.add(isoDay(row.created_at));
  }
  for (const row of attemptsResult.data ?? []) {
    if (row.completed_at) {
      days.add(isoDay(row.completed_at));
    }
  }

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 90; i += 1) {
    const key = isoDay(cursor);
    if (!days.has(key)) {
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export function buildCoachSystemPrompt(
  ctx: CoachUserContext,
  locale: CoachLocale,
): string {
  const intro =
    locale === "ru"
      ? "Ты — персональный шахматный AI-тренер BlunderLab. Отвечай дружелюбно, структурированно и кратко (2–4 коротких абзаца, можно списки). Опирайся на конкретные данные пользователя ниже. Если пользователь спрашивает что-то вне шахмат, мягко возвращай в шахматную тренировочную плоскость."
      : "You are BlunderLab's personal chess AI coach. Respond warmly and concisely (2-4 short paragraphs, lists welcome). Anchor every answer in the user's actual data below. If the user asks something off-topic, gently steer back to chess training.";

  const profile =
    locale === "ru"
      ? `Имя: ${ctx.displayName}\nГород: ${ctx.city ?? "—"}\nСложность по умолчанию: ${ctx.defaultDifficulty}\nИдентичность: ${ctx.identity} (${ctx.identityDescription})\nСтрик дней: ${ctx.streak}\nРевью за 30 дней: ${ctx.reviewedCount30d}\nГлавная слабость недели: ${ctx.topPattern ?? "недостаточно данных"} (динамика: ${humanDirection(ctx.weeklyDirection, "ru")})\nТекущая цель тренировки: ${ctx.activeGoal ?? "пока не выбрана"}`
      : `Name: ${ctx.displayName}\nCity: ${ctx.city ?? "n/a"}\nDefault difficulty: ${ctx.defaultDifficulty}\nIdentity: ${ctx.identity} (${ctx.identityDescription})\nStreak (days): ${ctx.streak}\nReviews in last 30 days: ${ctx.reviewedCount30d}\nWeekly weakness: ${ctx.topPattern ?? "insufficient data"} (trend: ${humanDirection(ctx.weeklyDirection, "en")})\nActive training goal: ${ctx.activeGoal ?? "none yet"}`;

  const recent = ctx.recentReviews.length
    ? ctx.recentReviews
        .map(
          (review) =>
            `- ${review.date} · pattern: ${review.pattern ?? "clean"} · blunders: ${review.blunders} · mistakes: ${review.mistakes}${review.goal ? ` · goal: ${review.goal}` : ""}`,
        )
        .join("\n")
    : locale === "ru"
      ? "пока нет ревью"
      : "no reviews yet";

  const recentHeader = locale === "ru" ? "Последние ревью:" : "Recent reviews:";

  const guardrails =
    locale === "ru"
      ? "Правила: всегда давай один следующий конкретный шаг. Не выдумывай статистику, которой нет в данных. Если данных мало — честно скажи и предложи что отыграть, чтобы их собрать."
      : "Rules: always end with one concrete next step. Never invent stats that aren't in the data. If data is thin, say so and recommend what to play to fill it.";

  return [
    intro,
    "",
    locale === "ru" ? "Профиль игрока:" : "Player profile:",
    profile,
    "",
    recentHeader,
    recent,
    "",
    guardrails,
  ].join("\n");
}

function humanDirection(
  direction: CoachUserContext["weeklyDirection"],
  locale: CoachLocale,
): string {
  if (locale === "ru") {
    if (direction === "down") return "улучшается";
    if (direction === "up") return "ухудшается";
    if (direction === "same") return "стабильно";
    return "недостаточно данных";
  }
  if (direction === "down") return "improving";
  if (direction === "up") return "worsening";
  if (direction === "same") return "stable";
  return "insufficient data";
}
