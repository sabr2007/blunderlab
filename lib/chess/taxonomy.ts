import type {
  BlunderCategory,
  ReviewSeverity,
} from "@/lib/supabase/database.types";
import { Chess, type Square } from "chess.js";
import { type CriticalMoment, severityFromDrop } from "./critical-moments";
import type { PlayerColor } from "./types";

export type TaxonomyResult = {
  category: BlunderCategory;
  severity: ReviewSeverity;
  candidates: BlunderCategory[];
  diagnostics: Record<string, string>;
};

const ORDER: BlunderCategory[] = [
  "Hanging Piece",
  "Missed Tactic",
  "King Safety",
  "Tunnel Vision",
  "Greedy Move",
  "Time Panic",
  "Opening Drift",
  "Endgame Technique",
];

type Detector = (input: DetectorInput) => string | null;

type DetectorInput = {
  moment: CriticalMoment;
  userColor: PlayerColor;
};

export function classifyMoment(
  moment: CriticalMoment,
  userColor: PlayerColor,
): TaxonomyResult {
  const input: DetectorInput = { moment, userColor };
  const candidates: BlunderCategory[] = [];
  const diagnostics: Record<string, string> = {};

  for (const category of ORDER) {
    const detector = DETECTORS[category];
    const reason = detector(input);

    if (reason) {
      candidates.push(category);
      diagnostics[category] = reason;
    }
  }

  const fallback: BlunderCategory =
    moment.ply.ply <= 20 ? "Opening Drift" : "Missed Tactic";

  const category = candidates[0] ?? fallback;
  const severity: ReviewSeverity = severityFromDrop(moment.evalDropCp);

  return {
    category,
    severity,
    candidates: candidates.length > 0 ? candidates : [fallback],
    diagnostics,
  };
}

const DETECTORS: Record<BlunderCategory, Detector> = {
  "Hanging Piece": ({ moment, userColor }) => {
    const target = moment.ply.to as Square;

    if (!isPieceHangingAt(moment.ply.fenAfter, target, userColor)) {
      return null;
    }

    return `Piece on ${target} is attacked and undefended after the move.`;
  },

  "Missed Tactic": ({ moment }) => {
    if (moment.evalDropCp < 200) {
      return null;
    }

    const userPlayedForcing = isForcingMove(
      moment.ply.fenBefore,
      moment.ply.from as Square,
      moment.ply.to as Square,
    );

    if (userPlayedForcing) {
      return null;
    }

    return `Engine's best move ${moment.ply.bestMove ?? ""} swings ${formatPawns(moment.evalDropCp)} pawns in your favour.`;
  },

  "King Safety": ({ moment, userColor }) => {
    const before = kingShelter(moment.ply.fenBefore, userColor);
    const after = kingShelter(moment.ply.fenAfter, userColor);
    const shelterDelta = before.pawnShield - after.pawnShield;

    if (!after.kingInDanger && shelterDelta < 1) {
      return null;
    }

    return `King shelter dropped by ${shelterDelta} pawns; ${
      after.kingInDanger ? "king is now in danger." : "king exposure increased."
    }`;
  },

  "Tunnel Vision": ({ moment, userColor }) => {
    const userMoveAggressive = isForcingMove(
      moment.ply.fenBefore,
      moment.ply.from as Square,
      moment.ply.to as Square,
    );

    if (!userMoveAggressive) {
      return null;
    }

    if (!moment.ply.bestMove) {
      return null;
    }

    const bestIsDefensive = isDefensiveMove(
      moment.ply.fenBefore,
      moment.ply.bestMove,
      userColor,
    );

    if (!bestIsDefensive) {
      return null;
    }

    return "You continued attacking while the engine recommended defending.";
  },

  "Greedy Move": ({ moment }) => {
    const captured = wasCapture(moment.ply.fenBefore, moment.ply.to as Square);

    if (!captured) {
      return null;
    }

    if (moment.evalDropCp < 150) {
      return null;
    }

    return `Capture on ${moment.ply.to} cost ${formatPawns(moment.evalDropCp)} pawns.`;
  },

  "Time Panic": () => null,

  "Opening Drift": ({ moment }) => {
    if (moment.ply.ply > 20) {
      return null;
    }

    if (moment.evalDropCp < 100) {
      return null;
    }

    return "Early-phase deviation worsened the position.";
  },

  "Endgame Technique": ({ moment }) => {
    const pieces = countPieces(moment.ply.fenBefore);

    if (pieces > 12) {
      return null;
    }

    if (moment.evalDropCp < 100) {
      return null;
    }

    return `Endgame phase (${pieces} pieces); a more precise method existed.`;
  },
};

function isPieceHangingAt(
  fen: string,
  square: Square,
  userColor: PlayerColor,
): boolean {
  const chess = new Chess(fen);
  const piece = chess.get(square);

  if (!piece) {
    return false;
  }

  const ownTag = userColor === "white" ? "w" : "b";

  if (piece.color !== ownTag) {
    return false;
  }

  const attackers = safeAttackers(
    chess,
    square,
    userColor === "white" ? "b" : "w",
  );

  if (attackers.length === 0) {
    return false;
  }

  const defenders = safeAttackers(chess, square, ownTag);

  return defenders.length === 0;
}

function safeAttackers(chess: Chess, square: Square, color: "w" | "b") {
  type ChessAttackers = {
    attackers?: (square: Square, color: "w" | "b") => Square[];
  };

  const fn = (chess as unknown as ChessAttackers).attackers;

  if (typeof fn === "function") {
    return fn.call(chess, square, color);
  }

  return [];
}

function wasCapture(fenBefore: string, target: Square) {
  const chess = new Chess(fenBefore);
  const piece = chess.get(target);
  return Boolean(piece);
}

function isForcingMove(fenBefore: string, from: Square, to: Square): boolean {
  const chess = new Chess(fenBefore);

  if (wasCapture(fenBefore, to)) {
    return true;
  }

  try {
    const move = chess.move({ from, to, promotion: "q" });

    if (!move) {
      return false;
    }

    if (chess.isCheck()) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function isDefensiveMove(
  fenBefore: string,
  uci: string,
  userColor: PlayerColor,
): boolean {
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci.trim());

  if (!match) {
    return false;
  }

  const [, from, to] = match;
  const chess = new Chess(fenBefore);
  const piece = chess.get(from as Square);

  if (!piece) {
    return false;
  }

  if (piece.type === "k") {
    return true;
  }

  const kingSquare = findKing(chess, userColor);

  if (!kingSquare) {
    return false;
  }

  const fileDistance = Math.abs(to.charCodeAt(0) - kingSquare.charCodeAt(0));
  const rankDistance = Math.abs(Number(to[1]) - Number(kingSquare[1]));

  return fileDistance + rankDistance <= 2;
}

type KingShelter = {
  pawnShield: number;
  kingInDanger: boolean;
};

function kingShelter(fen: string, userColor: PlayerColor): KingShelter {
  const chess = new Chess(fen);
  const kingSquare = findKing(chess, userColor);

  if (!kingSquare) {
    return { pawnShield: 0, kingInDanger: false };
  }

  const file = kingSquare.charCodeAt(0) - "a".charCodeAt(0);
  const rank = Number(kingSquare[1]);
  const pawnRank = userColor === "white" ? rank + 1 : rank - 1;
  const ownColorTag: "w" | "b" = userColor === "white" ? "w" : "b";

  let pawnShield = 0;

  for (const offset of [-1, 0, 1]) {
    const adjacentFile = file + offset;
    if (adjacentFile < 0 || adjacentFile > 7) {
      continue;
    }

    const square = `${String.fromCharCode("a".charCodeAt(0) + adjacentFile)}${pawnRank}`;
    const piece = chess.get(square as Square);

    if (piece && piece.type === "p" && piece.color === ownColorTag) {
      pawnShield += 1;
    }
  }

  const enemyColor: "w" | "b" = userColor === "white" ? "b" : "w";
  const attackers = safeAttackers(chess, kingSquare as Square, enemyColor);
  const kingInDanger = attackers.length > 0 || chess.isCheck();

  return { pawnShield, kingInDanger };
}

function findKing(chess: Chess, userColor: PlayerColor): Square | null {
  const board = chess.board();
  const colorTag = userColor === "white" ? "w" : "b";

  for (let r = 0; r < board.length; r += 1) {
    for (let f = 0; f < board[r].length; f += 1) {
      const cell = board[r][f];
      if (cell && cell.type === "k" && cell.color === colorTag) {
        return cell.square as Square;
      }
    }
  }

  return null;
}

function countPieces(fen: string): number {
  const placement = fen.split(" ")[0];
  let count = 0;

  for (const ch of placement) {
    if (/[prnbqkPRNBQK]/.test(ch)) {
      count += 1;
    }
  }

  return count;
}

function formatPawns(cp: number): string {
  return (cp / 100).toFixed(1);
}
