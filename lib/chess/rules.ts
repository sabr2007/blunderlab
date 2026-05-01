import { Chess, type Move, type Square } from "chess.js";
import type {
  GameSnapshot,
  GameStatus,
  GameWinner,
  MoveActor,
  MoveRecord,
  MoveResult,
} from "./types";

export type ReplayMove = {
  from: string;
  to: string;
  promotion?: string | null;
};

export const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function createGame(fen = STARTING_FEN) {
  return new Chess(fen);
}

export function getSnapshot(chess: Chess): GameSnapshot {
  const status = getGameStatus(chess);

  return {
    fen: chess.fen(),
    pgn: chess.pgn(),
    turn: chess.turn(),
    status,
    winner: getWinner(chess, status),
    isCheck: chess.isCheck(),
    isGameOver: chess.isGameOver(),
    history: chess.history({ verbose: true }),
  };
}

export function getSnapshotFromFen(fen: string): GameSnapshot {
  return getSnapshot(createGame(fen));
}

export function tryMove(
  fen: string,
  move: { from: string; to: string; promotion?: string },
  actor: MoveActor,
): MoveResult {
  const chess = createGame(fen);
  const fenBefore = chess.fen();

  try {
    const applied = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion ?? "q",
    });

    const snapshot = getSnapshot(chess);

    return {
      ok: true,
      move: applied,
      record: toMoveRecord(
        applied,
        actor,
        fenBefore,
        snapshot.fen,
        snapshot.history.length,
      ),
      snapshot,
    };
  } catch {
    return {
      ok: false,
      error: "Illegal move",
      snapshot: getSnapshot(chess),
    };
  }
}

export function tryUciMove(
  fen: string,
  uci: string,
  actor: MoveActor,
): MoveResult {
  const parsed = parseUciMove(uci);

  if (!parsed) {
    return {
      ok: false,
      error: `Invalid UCI move: ${uci}`,
      snapshot: getSnapshotFromFen(fen),
    };
  }

  return tryMove(fen, parsed, actor);
}

export function getLegalTargetSquares(fen: string, from: Square): Square[] {
  const chess = createGame(fen);

  return chess.moves({ square: from, verbose: true }).map((move) => move.to);
}

export function isSquare(value: string): value is Square {
  return /^[a-h][1-8]$/.test(value);
}

export function buildPgn(
  moves: ReplayMove[],
  initialFen: string = STARTING_FEN,
): { pgn: string; finalFen: string } {
  const chess = createGame(initialFen);

  for (const move of moves) {
    chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion ?? "q",
    });
  }

  return { pgn: chess.pgn(), finalFen: chess.fen() };
}

export function parseUciMove(uci: string) {
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci.trim());

  if (!match) {
    return null;
  }

  return {
    from: match[1],
    to: match[2],
    promotion: match[3],
  };
}

function getGameStatus(chess: Chess): GameStatus {
  if (chess.isCheckmate()) {
    return "checkmate";
  }

  if (chess.isStalemate()) {
    return "stalemate";
  }

  if (chess.isDraw()) {
    return "draw";
  }

  return "active";
}

function getWinner(chess: Chess, status: GameStatus): GameWinner {
  if (status !== "checkmate") {
    return null;
  }

  return chess.turn() === "w" ? "black" : "white";
}

function toMoveRecord(
  move: Move,
  actor: MoveActor,
  fenBefore: string,
  fenAfter: string,
  ply: number,
): MoveRecord {
  return {
    ply,
    moveNumber: Math.ceil(ply / 2),
    actor,
    color: move.color === "w" ? "white" : "black",
    san: move.san,
    uci: `${move.from}${move.to}${move.promotion ?? ""}`,
    from: move.from,
    to: move.to,
    promotion: move.promotion,
    fenBefore,
    fenAfter,
  };
}
