"use server";

import { isRealUser } from "@/lib/auth/session";
import type {
  CriticalMomentRow,
  DailyBlunderAttemptRow,
} from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type DailyBlunderMoment = Pick<
  CriticalMomentRow,
  | "id"
  | "fen_before"
  | "user_move"
  | "best_move"
  | "category"
  | "severity"
  | "move_number"
  | "explanation"
  | "training_hint"
  | "created_at"
>;

export type DailyBlunderPayload = {
  attempt: DailyBlunderAttemptRow;
  moment: DailyBlunderMoment;
};

export type DailyBlunderResult =
  | {
      kind: "ok";
      success: boolean;
      userMove: string;
      correctMove: string;
      explanation: string;
      trainingHint: string | null;
    }
  | { kind: "error"; message: string };

export async function getOrCreateTodaysBlunder(
  userId: string,
): Promise<DailyBlunderPayload | null> {
  const supabase = await getSupabaseServerClient();
  const today = todayUtcDate();

  const existing = await supabase
    .from("daily_blunder_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("attempt_date", today)
    .maybeSingle();

  if (existing.data) {
    const moment = await loadMoment(existing.data.moment_id, userId);
    return moment ? { attempt: existing.data, moment } : null;
  }

  const moments = await supabase
    .from("critical_moments")
    .select(
      "id,fen_before,user_move,best_move,category,severity,move_number,explanation,training_hint,created_at",
    )
    .eq("user_id", userId)
    .in("severity", ["mistake", "blunder"])
    .order("created_at", { ascending: true })
    .limit(100);

  if (!moments.data || moments.data.length === 0) {
    return null;
  }

  const used = await supabase
    .from("daily_blunder_attempts")
    .select("moment_id")
    .eq("user_id", userId);
  const usedIds = new Set((used.data ?? []).map((row) => row.moment_id));
  const moment =
    moments.data.find((candidate) => !usedIds.has(candidate.id)) ??
    moments.data[0];

  const inserted = await supabase
    .from("daily_blunder_attempts")
    .insert({
      user_id: userId,
      moment_id: moment.id,
      attempt_date: today,
    })
    .select("*")
    .single();

  if (inserted.data) {
    return { attempt: inserted.data, moment };
  }

  const retry = await supabase
    .from("daily_blunder_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("attempt_date", today)
    .maybeSingle();

  if (!retry.data) {
    return null;
  }

  const retryMoment = await loadMoment(retry.data.moment_id, userId);
  return retryMoment ? { attempt: retry.data, moment: retryMoment } : null;
}

export async function submitDailyBlunderAttemptAction(
  attemptId: string,
  userMove: string,
): Promise<DailyBlunderResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    return { kind: "error", message: "Sign in is required." };
  }

  const attempt = await supabase
    .from("daily_blunder_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!attempt.data) {
    return { kind: "error", message: "Daily Blunder attempt not found." };
  }

  const moment = await loadMoment(attempt.data.moment_id, user.id);
  if (!moment) {
    return { kind: "error", message: "Daily Blunder moment not found." };
  }

  const normalizedUserMove = normalizeUci(userMove);
  const normalizedBestMove = normalizeUci(moment.best_move);
  const success = normalizedUserMove === normalizedBestMove;
  const now = new Date().toISOString();

  await supabase
    .from("daily_blunder_attempts")
    .update({
      user_move: normalizedUserMove,
      success,
      completed_at: success ? now : attempt.data.completed_at,
    })
    .eq("id", attemptId)
    .eq("user_id", user.id);

  return {
    kind: "ok",
    success,
    userMove: normalizedUserMove,
    correctMove: normalizedBestMove,
    explanation:
      moment.explanation ??
      "The engine found a better move here. Compare your move with the best move and look for the forcing idea.",
    trainingHint: moment.training_hint,
  };
}

export async function revealDailyBlunderAction(
  attemptId: string,
): Promise<DailyBlunderResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    return { kind: "error", message: "Sign in is required." };
  }

  const attempt = await supabase
    .from("daily_blunder_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!attempt.data) {
    return { kind: "error", message: "Daily Blunder attempt not found." };
  }

  const moment = await loadMoment(attempt.data.moment_id, user.id);
  if (!moment) {
    return { kind: "error", message: "Daily Blunder moment not found." };
  }

  await supabase
    .from("daily_blunder_attempts")
    .update({ revealed_at: new Date().toISOString() })
    .eq("id", attemptId)
    .eq("user_id", user.id);

  return {
    kind: "ok",
    success: false,
    userMove: attempt.data.user_move ?? "",
    correctMove: normalizeUci(moment.best_move),
    explanation:
      moment.explanation ??
      "Reveal the best move, then replay the position and ask what candidate move you missed.",
    trainingHint: moment.training_hint,
  };
}

async function loadMoment(momentId: string, userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("critical_moments")
    .select(
      "id,fen_before,user_move,best_move,category,severity,move_number,explanation,training_hint,created_at",
    )
    .eq("id", momentId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

function normalizeUci(value: string): string {
  return value.trim().toLowerCase();
}

function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}
