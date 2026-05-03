import { loadReviewBundle } from "@/app/review/actions";
import { ReviewView } from "@/components/review/review-view";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Review",
  description: "Review your game with the BlunderLab AI Coach.",
};

type PageProps = {
  params: Promise<{ locale: string; gameId: string }>;
};

export default async function ReviewPage({ params }: PageProps) {
  const { gameId } = await params;
  const result = await loadReviewBundle(gameId);

  if (result.kind === "no-game" || result.kind === "unauthorized") {
    notFound();
  }

  if (result.kind === "ok") {
    return (
      <ReviewView
        gameId={gameId}
        initialBundle={result.bundle}
        game={{
          id: result.bundle.game.id,
          status: result.bundle.game.status,
          winner: result.bundle.game.winner,
          pgn: result.bundle.game.pgn,
          ai_difficulty: result.bundle.game.ai_difficulty,
          player_color: result.bundle.game.player_color,
          move_count: result.bundle.game.move_count,
          initial_fen: "",
          final_fen: null,
        }}
      />
    );
  }

  return <ReviewView gameId={gameId} initialBundle={null} game={result.game} />;
}
