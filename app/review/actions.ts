"use server";

import type { CriticalMoment } from "@/lib/chess/critical-moments";
import { classifyMoment } from "@/lib/chess/taxonomy";
import { runCoach } from "@/lib/coach";
import type { CoachInput, CoachOutput } from "@/lib/coach/types";
import type {
  CriticalMomentInput,
  GameForReview,
  ReviewBundle,
  ReviewCriticalMoment,
  ReviewSummary,
  SubmitReviewInput,
  SubmitReviewResult,
} from "@/lib/review/types";
import type {
  BlunderCategory,
  CriticalMomentRow,
  GameReviewRow,
  GameRow,
  ReviewSeverity,
} from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const DEFAULT_DAILY_LIMIT = 3;

export async function loadReviewBundle(
  gameId: string,
): Promise<
  | { kind: "ok"; bundle: ReviewBundle }
  | { kind: "needs-analysis"; game: GameForReview }
  | { kind: "no-game" }
  | { kind: "unauthorized" }
> {
  const supabase = await getSupabaseServerClient();
  const userResult = await supabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    return { kind: "unauthorized" };
  }

  const game = await supabase
    .from("games")
    .select(
      "id,status,winner,pgn,ai_difficulty,player_color,move_count,initial_fen,final_fen,user_id",
    )
    .eq("id", gameId)
    .maybeSingle();

  if (game.error || !game.data) {
    return { kind: "no-game" };
  }

  const gameForReview: GameForReview = {
    id: game.data.id,
    status: game.data.status,
    winner: game.data.winner,
    pgn: game.data.pgn,
    ai_difficulty: game.data.ai_difficulty,
    player_color: game.data.player_color,
    move_count: game.data.move_count,
    initial_fen: game.data.initial_fen,
    final_fen: game.data.final_fen,
  };

  const review = await supabase
    .from("game_reviews")
    .select("*")
    .eq("game_id", gameId)
    .maybeSingle();

  if (review.error || !review.data) {
    return { kind: "needs-analysis", game: gameForReview };
  }

  const moments = await supabase
    .from("critical_moments")
    .select("*")
    .eq("review_id", review.data.id)
    .order("ply", { ascending: true });

  if (moments.error) {
    return { kind: "needs-analysis", game: gameForReview };
  }

  return {
    kind: "ok",
    bundle: assembleBundle(game.data, review.data, moments.data ?? []),
  };
}

export async function submitReviewAction(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  const supabase = await getSupabaseServerClient();
  const userResult = await supabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    return { kind: "error", message: "Sign in is required to review games." };
  }

  const userId = userResult.data.user.id;

  const game = await supabase
    .from("games")
    .select(
      "id,status,winner,pgn,ai_difficulty,player_color,move_count,user_id",
    )
    .eq("id", input.gameId)
    .eq("user_id", userId)
    .maybeSingle();

  if (game.error || !game.data) {
    return { kind: "error", message: "Game not found." };
  }

  // Cache hit
  const existing = await supabase
    .from("game_reviews")
    .select("*")
    .eq("game_id", input.gameId)
    .maybeSingle();

  if (existing.data) {
    const moments = await supabase
      .from("critical_moments")
      .select("*")
      .eq("review_id", existing.data.id)
      .order("ply", { ascending: true });

    return {
      kind: "ok",
      bundle: assembleBundle(game.data, existing.data, moments.data ?? []),
    };
  }

  // Rate limit (free tier)
  const limit = readDailyLimit();
  const today = todayUtcDate();
  const usage = await supabase
    .from("daily_review_usage")
    .select("reviews_used")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  const used = usage.data?.reviews_used ?? 0;

  if (used >= limit) {
    return {
      kind: "rate_limited",
      remaining: 0,
      resetAt: nextUtcMidnight(),
    };
  }

  // Run taxonomy + coach for each moment
  const enriched = await Promise.all(
    input.criticalMoments.map((moment) =>
      enrichMoment(moment, input.userColor, input.locale),
    ),
  );

  const aggregated = aggregateReview(enriched);

  // Persist review
  const reviewInsert = await supabase
    .from("game_reviews")
    .insert({
      game_id: input.gameId,
      user_id: userId,
      summary: aggregated.summary,
      main_category: aggregated.mainCategory,
      blunder_count: aggregated.blunderCount,
      mistake_count: aggregated.mistakeCount,
      training_goal: aggregated.trainingGoal,
      coach_locale: input.locale,
      review_model: aggregated.reviewModel,
    })
    .select("*")
    .single();

  if (reviewInsert.error || !reviewInsert.data) {
    return {
      kind: "error",
      message: reviewInsert.error?.message ?? "Failed to save review.",
    };
  }

  if (enriched.length > 0) {
    const momentsRows: Array<Omit<CriticalMomentRow, "id" | "created_at">> =
      enriched.map((item) => ({
        review_id: reviewInsert.data.id,
        game_id: input.gameId,
        user_id: userId,
        move_id: null,
        ply: item.input.ply,
        move_number: item.input.moveNumber,
        category: item.coach.category,
        severity: item.coach.severity,
        user_move: item.input.uci,
        best_move: item.input.bestMove ?? "",
        eval_before_cp: item.input.evalBeforeCp,
        eval_after_cp: item.input.evalAfterCp,
        eval_drop_cp: Math.round(item.input.evalDropCp),
        fen_before: item.input.fenBefore,
        fen_after: item.input.fenAfter,
        explanation: item.coach.explanation,
        training_hint: item.coach.trainingHint,
      }));

    const momentsInsert = await supabase
      .from("critical_moments")
      .insert(momentsRows);

    if (momentsInsert.error) {
      return { kind: "error", message: momentsInsert.error.message };
    }
  }

  // Bump daily usage (upsert)
  await supabase.from("daily_review_usage").upsert(
    {
      user_id: userId,
      usage_date: today,
      reviews_used: used + 1,
    },
    { onConflict: "user_id,usage_date" },
  );

  revalidatePath(`/review/${input.gameId}`);

  const moments = await supabase
    .from("critical_moments")
    .select("*")
    .eq("review_id", reviewInsert.data.id)
    .order("ply", { ascending: true });

  return {
    kind: "ok",
    bundle: assembleBundle(game.data, reviewInsert.data, moments.data ?? []),
  };
}

type EnrichedMoment = {
  input: CriticalMomentInput;
  coach: CoachOutput;
  taxonomyCategory: BlunderCategory;
};

async function enrichMoment(
  input: CriticalMomentInput,
  userColor: "white" | "black",
  locale: "en" | "ru",
): Promise<EnrichedMoment> {
  const fakeMoment: CriticalMoment = {
    ply: {
      ply: input.ply,
      moveNumber: input.moveNumber,
      color: input.color,
      san: input.san,
      uci: input.uci,
      from: input.from,
      to: input.to,
      promotion: input.promotion ?? undefined,
      fenBefore: input.fenBefore,
      fenAfter: input.fenAfter,
      bestMove: input.bestMove,
      bestMoveSan: input.bestMoveSan,
      evalBefore: {
        cp: input.evalBeforeCp,
        mate: input.evalBeforeMate,
      },
      evalAfter: {
        cp: input.evalAfterCp,
        mate: input.evalAfterMate,
      },
    },
    evalDropCp: input.evalDropCp,
    evalBeforeUserCp: input.evalBeforeCp ?? 0,
    evalAfterUserCp: input.evalAfterCp ?? 0,
  };

  const taxonomy = classifyMoment(fakeMoment, userColor);

  const coachInput: CoachInput = {
    locale,
    fenBefore: input.fenBefore,
    fenAfter: input.fenAfter,
    userMove: input.uci,
    bestMove: input.bestMove,
    evalDropCp: Math.round(input.evalDropCp),
    candidateCategories: taxonomy.candidates,
    preferredCategory: taxonomy.category,
    severity: taxonomy.severity,
    movedPiece: input.movedPiece,
    movedPieceSquare: input.from,
  };

  const coach = await runCoach(coachInput);

  return {
    input,
    coach,
    taxonomyCategory: taxonomy.category,
  };
}

type AggregateResult = {
  summary: string;
  mainCategory: BlunderCategory | null;
  blunderCount: number;
  mistakeCount: number;
  trainingGoal: string;
  reviewModel: string;
};

function aggregateReview(items: EnrichedMoment[]): AggregateResult {
  if (items.length === 0) {
    return {
      summary: "No critical moments detected — clean game.",
      mainCategory: null,
      blunderCount: 0,
      mistakeCount: 0,
      trainingGoal:
        "Keep your discipline: at every move, scan checks, captures, and threats.",
      reviewModel: "clean",
    };
  }

  const categoryCounts = new Map<BlunderCategory, number>();
  let blunderCount = 0;
  let mistakeCount = 0;
  let usedOpenAi = false;

  for (const item of items) {
    categoryCounts.set(
      item.coach.category,
      (categoryCounts.get(item.coach.category) ?? 0) + 1,
    );

    if (item.coach.severity === "blunder") {
      blunderCount += 1;
    }

    if (item.coach.severity === "mistake") {
      mistakeCount += 1;
    }

    if (item.coach.source === "openai") {
      usedOpenAi = true;
    }
  }

  let mainCategory: BlunderCategory | null = null;
  let bestCount = 0;
  for (const [category, count] of categoryCounts) {
    if (count > bestCount) {
      bestCount = count;
      mainCategory = category;
    }
  }

  // Severity ordering: blunder > mistake > inaccuracy
  const sortedBySeverity = [...items].sort(
    (a, b) => severityRank(b.coach.severity) - severityRank(a.coach.severity),
  );
  const trainingGoal = sortedBySeverity[0].coach.trainingHint;

  const summary = mainCategory
    ? `Main pattern: ${mainCategory}. ${items.length} critical moment${items.length === 1 ? "" : "s"} detected.`
    : `${items.length} critical moment${items.length === 1 ? "" : "s"} detected.`;

  return {
    summary,
    mainCategory,
    blunderCount,
    mistakeCount,
    trainingGoal,
    reviewModel: usedOpenAi
      ? (process.env.OPENAI_MODEL ?? "gpt-4o-mini")
      : "fallback",
  };
}

function severityRank(severity: ReviewSeverity): number {
  if (severity === "blunder") return 3;
  if (severity === "mistake") return 2;
  return 1;
}

function assembleBundle(
  game: Pick<
    GameRow,
    | "id"
    | "status"
    | "winner"
    | "pgn"
    | "ai_difficulty"
    | "player_color"
    | "move_count"
  >,
  review: GameReviewRow,
  moments: CriticalMomentRow[],
): ReviewBundle {
  const reviewSummary: ReviewSummary = {
    id: review.id,
    gameId: review.game_id,
    summary: review.summary,
    mainCategory: review.main_category,
    blunderCount: review.blunder_count,
    mistakeCount: review.mistake_count,
    trainingGoal: review.training_goal,
    coachLocale: review.coach_locale,
    reviewModel: review.review_model,
  };

  const criticalMoments: ReviewCriticalMoment[] = moments.map((m) => ({
    id: m.id,
    ply: m.ply,
    moveNumber: m.move_number,
    category: m.category,
    severity: m.severity,
    userMove: m.user_move,
    bestMove: m.best_move,
    evalBeforeCp: m.eval_before_cp,
    evalAfterCp: m.eval_after_cp,
    evalDropCp: m.eval_drop_cp,
    fenBefore: m.fen_before,
    fenAfter: m.fen_after,
    explanation: m.explanation ?? "",
    trainingHint: m.training_hint ?? "",
  }));

  return {
    game: {
      id: game.id,
      status: game.status,
      winner: game.winner,
      pgn: game.pgn,
      ai_difficulty: game.ai_difficulty,
      player_color: game.player_color,
      move_count: game.move_count,
    },
    review: reviewSummary,
    criticalMoments,
  };
}

function readDailyLimit(): number {
  const raw = process.env.REVIEW_DAILY_LIMIT;
  if (!raw) return DEFAULT_DAILY_LIMIT;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_LIMIT;
}

function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextUtcMidnight(): string {
  const now = new Date();
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );
  return next.toISOString();
}
