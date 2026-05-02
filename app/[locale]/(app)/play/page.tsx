import { PlayView } from "@/components/chess/play-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play",
  description: "Play a legal chess game against Stockfish in BlunderLab.",
};

export default function PlayPage() {
  return <PlayView />;
}
