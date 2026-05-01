"use server";

import type {
  FinalizeGameInput,
  StartGameInput,
  StartGameResult,
} from "@/lib/review/types";
import type { GameMoveRow } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function startGameAction(
  input: StartGameInput,
): Promise<{ ok: true; data: StartGameResult } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerClient();
  const userResult = await supabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    return { ok: false, error: "Sign in is required to start a game." };
  }

  const userId = userResult.data.user.id;

  await ensureProfile(supabase, userId);

  const insertResult = await supabase
    .from("games")
    .insert({
      user_id: userId,
      ai_difficulty: input.difficulty,
      player_color: input.playerColor,
      initial_fen: input.initialFen,
      status: "active",
    })
    .select("id")
    .single();

  if (insertResult.error || !insertResult.data) {
    return {
      ok: false,
      error: insertResult.error?.message ?? "Failed to create game.",
    };
  }

  return {
    ok: true,
    data: { gameId: insertResult.data.id, userId },
  };
}

export async function finalizeGameAction(
  input: FinalizeGameInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerClient();
  const userResult = await supabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    return { ok: false, error: "Sign in is required to save a game." };
  }

  const userId = userResult.data.user.id;

  const updateResult = await supabase
    .from("games")
    .update({
      status: input.status,
      winner: input.winner,
      final_fen: input.finalFen,
      pgn: input.pgn,
      move_count: input.moves.length,
      ended_at: new Date().toISOString(),
    })
    .eq("id", input.gameId)
    .eq("user_id", userId);

  if (updateResult.error) {
    return { ok: false, error: updateResult.error.message };
  }

  if (input.moves.length === 0) {
    revalidatePath(`/review/${input.gameId}`);
    return { ok: true };
  }

  const moveRows: Array<Omit<GameMoveRow, "id" | "created_at">> =
    input.moves.map((move) => ({
      game_id: input.gameId,
      user_id: userId,
      ply: move.ply,
      move_number: move.moveNumber,
      color: move.color,
      actor: move.actor,
      san: move.san,
      uci: move.uci,
      from_square: move.from,
      to_square: move.to,
      promotion: move.promotion ?? null,
      fen_before: move.fenBefore,
      fen_after: move.fenAfter,
      eval_cp: null,
      eval_mate: null,
      time_spent_ms: null,
    }));

  const insertResult = await supabase.from("game_moves").insert(moveRows);

  if (insertResult.error) {
    return { ok: false, error: insertResult.error.message };
  }

  revalidatePath(`/review/${input.gameId}`);
  return { ok: true };
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!error && data) {
    return;
  }

  await supabase
    .from("profiles")
    .insert({
      id: userId,
      city: "Other",
      default_difficulty: "beginner",
    })
    .select("id")
    .maybeSingle();
}
