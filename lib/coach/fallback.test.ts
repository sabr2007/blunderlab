import type { BlunderCategory } from "@/lib/supabase/database.types";
import { describe, expect, it } from "vitest";
import { getFallbackCoachOutput } from "./fallback";
import type { CoachInput } from "./types";

const ALL_CATEGORIES: BlunderCategory[] = [
  "Hanging Piece",
  "Missed Tactic",
  "King Safety",
  "Tunnel Vision",
  "Greedy Move",
  "Time Panic",
  "Opening Drift",
  "Endgame Technique",
];

function input(
  category: BlunderCategory,
  locale: "en" | "ru" = "en",
): CoachInput {
  return {
    locale,
    fenBefore: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fenAfter: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    userMove: "e2e4",
    bestMove: "d2d4",
    evalDropCp: 200,
    candidateCategories: [category],
    preferredCategory: category,
    severity: "mistake",
    movedPiece: "p",
    movedPieceSquare: "e4",
  };
}

describe("getFallbackCoachOutput", () => {
  for (const category of ALL_CATEGORIES) {
    it(`renders English template for ${category}`, () => {
      const out = getFallbackCoachOutput(input(category));

      expect(out.source).toBe("fallback");
      expect(out.category).toBe(category);
      expect(out.severity).toBe("mistake");
      expect(out.explanation.length).toBeGreaterThan(20);
      expect(out.trainingHint.length).toBeGreaterThan(10);
    });
  }

  it("uses Russian translations when locale is ru", () => {
    const out = getFallbackCoachOutput(input("Hanging Piece", "ru"));
    expect(out.explanation).toMatch(/без защиты|защищена/);
  });

  it("substitutes the best move into Missed Tactic explanation", () => {
    const ctx = { ...input("Missed Tactic"), bestMove: "Nf6+" };
    const out = getFallbackCoachOutput(ctx);
    expect(out.explanation).toContain("Nf6+");
  });

  it("falls back gracefully when bestMove is missing", () => {
    const ctx = { ...input("Greedy Move"), bestMove: null };
    const out = getFallbackCoachOutput(ctx);
    expect(out.explanation.length).toBeGreaterThan(20);
  });
});
