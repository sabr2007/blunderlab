import type { Move, Square } from "chess.js";

export type AiDifficulty = "beginner" | "intermediate" | "advanced";

export type PlayerColor = "white" | "black";

export type GameStatus =
  | "active"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned"
  | "abandoned";

export type GameWinner = "white" | "black" | null;

export type MoveActor = "user" | "ai";

export type MoveRecord = {
  ply: number;
  moveNumber: number;
  actor: MoveActor;
  color: PlayerColor;
  san: string;
  uci: string;
  from: Square;
  to: Square;
  promotion?: string;
  fenBefore: string;
  fenAfter: string;
};

export type GameSnapshot = {
  fen: string;
  pgn: string;
  turn: "w" | "b";
  status: GameStatus;
  winner: GameWinner;
  isCheck: boolean;
  isGameOver: boolean;
  history: Move[];
};

export type MoveResult =
  | {
      ok: true;
      move: Move;
      record: MoveRecord;
      snapshot: GameSnapshot;
    }
  | {
      ok: false;
      error: string;
      snapshot: GameSnapshot;
    };

export type EngineSearchResult = {
  bestMove: string;
  ponder?: string;
  evaluation?: {
    type: "cp" | "mate";
    value: number;
  };
  depth?: number;
  principalVariation?: string[];
};

export type EnginePreset = {
  label: string;
  skillLevel: number;
  depth: number;
};
