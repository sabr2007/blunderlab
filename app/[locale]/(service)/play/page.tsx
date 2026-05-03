import { PlayView } from "@/components/chess/play-view";
import { loadActiveTrainingGoal } from "@/lib/training/progress";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play",
  description: "Play a legal chess game against Stockfish in BlunderLab.",
};

type PageProps = {
  searchParams: Promise<{ goal?: string }>;
};

export default async function PlayPage({ searchParams }: PageProps) {
  const { goal } = await searchParams;
  const activeGoal = await loadActiveTrainingGoal(goal);

  return <PlayView activeGoal={activeGoal} />;
}
