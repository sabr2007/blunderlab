import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import type { AnalyzedPly, CriticalMoment } from "./critical-moments";
import { classifyMoment } from "./taxonomy";

function buildMoment(
  fenBefore: string,
  uci: string,
  evalDropCp: number,
  bestMove: string | null = null,
): CriticalMoment {
  const chess = new Chess(fenBefore);
  const move = chess.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4) : "q",
  });

  if (!move) {
    throw new Error(`Move ${uci} illegal in ${fenBefore}`);
  }

  const ply: AnalyzedPly = {
    ply: 1,
    moveNumber: 1,
    color: move.color === "w" ? "white" : "black",
    san: move.san,
    uci,
    from: move.from,
    to: move.to,
    promotion: move.promotion,
    fenBefore,
    fenAfter: chess.fen(),
    bestMove,
    bestMoveSan: null,
    evalBefore: { cp: 100, mate: null },
    evalAfter: { cp: -100, mate: null },
  };

  return {
    ply,
    evalDropCp,
    evalBeforeUserCp: 100,
    evalAfterUserCp: 100 - evalDropCp,
  };
}

describe("classifyMoment", () => {
  it("flags Hanging Piece when the moved piece is attacked and undefended", () => {
    // White queen wanders to a square attacked by a black pawn, no defenders.
    // 4k3/3p4/8/3Q4/8/8/8/4K3 w - - 0 1 — White queen on d5; black pawn d7 attacks c6/e6.
    const fen = "4k3/3p4/8/3Q4/8/8/8/4K3 w - - 0 1";
    const moment = buildMoment(fen, "d5e6", 600);
    const result = classifyMoment(moment, "white");

    expect(result.candidates).toContain("Hanging Piece");
    expect(result.category).toBe("Hanging Piece");
    expect(result.severity).toBe("blunder");
  });

  it("flags Endgame Technique in low-piece positions", () => {
    // King + pawn vs king endgame.
    const fen = "8/8/8/4k3/8/8/4P3/4K3 w - - 0 1";
    const moment = buildMoment(fen, "e2e3", 150, "e2e4");
    moment.ply.ply = 60;
    moment.ply.moveNumber = 30;

    const result = classifyMoment(moment, "white");

    expect(result.candidates).toContain("Endgame Technique");
  });

  it("flags Opening Drift early in the game", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const moment = buildMoment(fen, "a2a3", 120, "e2e4");
    moment.ply.ply = 1;
    moment.ply.moveNumber = 1;

    const result = classifyMoment(moment, "white");

    expect(result.candidates).toContain("Opening Drift");
  });

  it("flags Greedy Move when the move was a capture and drop >= 1.5 pawns", () => {
    // White queen captures pawn but loses tempo (synthetic position).
    const fen = "4k3/8/8/3p4/8/8/8/3QK3 w - - 0 1";
    const moment = buildMoment(fen, "d1d5", 200);
    moment.ply.ply = 25;
    moment.ply.moveNumber = 13;

    const result = classifyMoment(moment, "white");
    expect(result.candidates).toContain("Greedy Move");
  });

  it("classifies severity from drop", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const blunder = classifyMoment(buildMoment(fen, "a2a3", 400), "white");
    const mistake = classifyMoment(buildMoment(fen, "a2a3", 200), "white");
    const inaccuracy = classifyMoment(buildMoment(fen, "a2a3", 110), "white");

    expect(blunder.severity).toBe("blunder");
    expect(mistake.severity).toBe("mistake");
    expect(inaccuracy.severity).toBe("inaccuracy");
  });
});
