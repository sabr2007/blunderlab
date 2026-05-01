import { Chess, type Square } from "chess.js";
import type { StockfishAnalyzer } from "./analysis";
import type { AnalyzedPly, EvalSnapshot } from "./critical-moments";
import type { PlayerColor } from "./types";

export type PipelinePhase =
  | "parsing"
  | "analyzing"
  | "scoring"
  | "submitting"
  | "done";

export type PipelineProgress = {
  phase: PipelinePhase;
  done: number;
  total: number;
  message?: string;
};

export type ProgressCallback = (progress: PipelineProgress) => void;

type UserMoveExtract = {
  ply: number;
  moveNumber: number;
  color: PlayerColor;
  san: string;
  from: string;
  to: string;
  uci: string;
  promotion?: string;
  movedPiece: string;
  fenBefore: string;
  fenAfter: string;
};

export function extractUserMoves(
  pgn: string,
  userColor: PlayerColor,
): UserMoveExtract[] {
  const chess = new Chess();

  if (!pgn) {
    return [];
  }

  try {
    chess.loadPgn(pgn);
  } catch {
    return [];
  }

  const verboseHistory = chess.history({ verbose: true });
  const wantedColorTag = userColor === "white" ? "w" : "b";

  const result: UserMoveExtract[] = [];

  for (let i = 0; i < verboseHistory.length; i += 1) {
    const move = verboseHistory[i];

    if (move.color !== wantedColorTag) {
      continue;
    }

    const ply = i + 1;
    const moveNumber = Math.ceil(ply / 2);

    result.push({
      ply,
      moveNumber,
      color: move.color === "w" ? "white" : "black",
      san: move.san,
      from: move.from,
      to: move.to,
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      promotion: move.promotion,
      movedPiece: move.piece,
      fenBefore: move.before,
      fenAfter: move.after,
    });
  }

  return result;
}

export async function analyzeUserMoves(
  analyzer: StockfishAnalyzer,
  pgn: string,
  userColor: PlayerColor,
  onProgress?: ProgressCallback,
): Promise<AnalyzedPly[]> {
  onProgress?.({ phase: "parsing", done: 0, total: 0 });

  const moves = extractUserMoves(pgn, userColor);

  if (moves.length === 0) {
    onProgress?.({ phase: "done", done: 0, total: 0 });
    return [];
  }

  const total = moves.length * 2;
  let done = 0;

  onProgress?.({ phase: "analyzing", done, total });

  const analyzed: AnalyzedPly[] = [];

  for (const move of moves) {
    const before = await analyzer.analyzePosition(move.fenBefore);
    done += 1;
    onProgress?.({ phase: "analyzing", done, total });

    const after = await analyzer.analyzePosition(move.fenAfter);
    done += 1;
    onProgress?.({ phase: "analyzing", done, total });

    analyzed.push({
      ply: move.ply,
      moveNumber: move.moveNumber,
      color: move.color,
      san: move.san,
      uci: move.uci,
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      fenBefore: move.fenBefore,
      fenAfter: move.fenAfter,
      bestMove: before.bestMove,
      bestMoveSan: bestMoveSan(move.fenBefore, before.bestMove),
      evalBefore: snapshot(before),
      evalAfter: snapshot(after),
    });
  }

  onProgress?.({ phase: "scoring", done: total, total });
  return analyzed;
}

function snapshot(result: {
  evalCp: number | null;
  evalMate: number | null;
}): EvalSnapshot {
  return {
    cp: result.evalCp,
    mate: result.evalMate,
  };
}

function bestMoveSan(fen: string, uci: string | null): string | null {
  if (!uci) return null;

  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci);
  if (!match) return null;

  try {
    const chess = new Chess(fen);
    const move = chess.move({
      from: match[1],
      to: match[2],
      promotion: match[3] ?? "q",
    });
    return move?.san ?? null;
  } catch {
    return null;
  }
}

export function pickedMovedPiece(
  uci: string,
  fenBefore: string,
): string | null {
  const match = /^([a-h][1-8])/.exec(uci);
  if (!match) return null;
  try {
    const chess = new Chess(fenBefore);
    const piece = chess.get(match[1] as Square);
    return piece?.type ?? null;
  } catch {
    return null;
  }
}
