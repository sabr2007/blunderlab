import type { AiDifficulty, MoveActor } from "@/lib/chess/types";
import type {
  BlunderCategory,
  GameRow,
  GameStatus,
  PlayerColor,
  ReviewSeverity,
} from "@/lib/supabase/database.types";

export type GameForReview = Pick<
  GameRow,
  | "id"
  | "status"
  | "winner"
  | "pgn"
  | "ai_difficulty"
  | "player_color"
  | "move_count"
  | "initial_fen"
  | "final_fen"
>;

export type StartGameInput = {
  difficulty: AiDifficulty;
  playerColor: PlayerColor;
  initialFen: string;
};

export type StartGameResult = {
  gameId: string;
  userId: string;
};

export type RecordedMove = {
  ply: number;
  moveNumber: number;
  color: PlayerColor;
  actor: MoveActor;
  san: string;
  uci: string;
  from: string;
  to: string;
  promotion?: string | null;
  fenBefore: string;
  fenAfter: string;
};

export type FinalizeGameInput = {
  gameId: string;
  status: GameStatus;
  winner: PlayerColor | null;
  finalFen: string;
  pgn: string;
  moves: RecordedMove[];
};

export type CriticalMomentInput = {
  ply: number;
  moveNumber: number;
  color: PlayerColor;
  san: string;
  uci: string;
  from: string;
  to: string;
  promotion?: string | null;
  fenBefore: string;
  fenAfter: string;
  bestMove: string | null;
  bestMoveSan: string | null;
  evalBeforeCp: number | null;
  evalAfterCp: number | null;
  evalBeforeMate: number | null;
  evalAfterMate: number | null;
  evalDropCp: number;
  movedPiece: string | null;
};

export type SubmitReviewInput = {
  gameId: string;
  userColor: PlayerColor;
  locale: "en" | "ru";
  criticalMoments: CriticalMomentInput[];
};

export type ReviewCriticalMoment = {
  id: string;
  ply: number;
  moveNumber: number;
  category: BlunderCategory;
  severity: ReviewSeverity;
  userMove: string;
  bestMove: string;
  evalBeforeCp: number | null;
  evalAfterCp: number | null;
  evalDropCp: number | null;
  fenBefore: string;
  fenAfter: string;
  explanation: string;
  trainingHint: string;
};

export type ReviewSummary = {
  id: string;
  gameId: string;
  summary: string | null;
  mainCategory: BlunderCategory | null;
  blunderCount: number;
  mistakeCount: number;
  trainingGoal: string | null;
  coachLocale: "en" | "ru";
  reviewModel: string | null;
};

export type ReviewBundle = {
  game: Pick<
    GameRow,
    | "id"
    | "status"
    | "winner"
    | "pgn"
    | "ai_difficulty"
    | "player_color"
    | "move_count"
  >;
  review: ReviewSummary;
  criticalMoments: ReviewCriticalMoment[];
};

export type SubmitReviewResult =
  | { kind: "ok"; bundle: ReviewBundle }
  | { kind: "rate_limited"; remaining: 0; resetAt: string }
  | { kind: "error"; message: string };
