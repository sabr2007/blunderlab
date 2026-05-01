export type AiDifficulty = "beginner" | "intermediate" | "advanced";
export type PlayerColor = "white" | "black";
export type GameStatus =
  | "active"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned"
  | "abandoned";
export type MoveActor = "user" | "ai";
export type ReviewSeverity = "inaccuracy" | "mistake" | "blunder";
export type BlunderCategory =
  | "Hanging Piece"
  | "Missed Tactic"
  | "King Safety"
  | "Tunnel Vision"
  | "Greedy Move"
  | "Time Panic"
  | "Opening Drift"
  | "Endgame Technique";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  city: "Almaty" | "Astana" | "Shymkent" | "Other";
  default_difficulty: AiDifficulty;
  created_at: string;
  updated_at: string;
};

export type GameRow = {
  id: string;
  user_id: string;
  player_color: PlayerColor;
  ai_difficulty: AiDifficulty;
  status: GameStatus;
  winner: PlayerColor | null;
  initial_fen: string;
  final_fen: string | null;
  pgn: string | null;
  move_count: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GameMoveRow = {
  id: number;
  game_id: string;
  user_id: string;
  ply: number;
  move_number: number;
  color: PlayerColor;
  actor: MoveActor;
  san: string;
  uci: string;
  from_square: string;
  to_square: string;
  promotion: string | null;
  fen_before: string;
  fen_after: string;
  eval_cp: number | null;
  eval_mate: number | null;
  time_spent_ms: number | null;
  created_at: string;
};

export type GameReviewRow = {
  id: string;
  game_id: string;
  user_id: string;
  summary: string | null;
  main_category: BlunderCategory | null;
  accuracy_score: number | null;
  blunder_count: number;
  mistake_count: number;
  training_goal: string | null;
  coach_locale: "en" | "ru";
  review_model: string | null;
  created_at: string;
  updated_at: string;
};

export type CriticalMomentRow = {
  id: string;
  review_id: string;
  game_id: string;
  user_id: string;
  move_id: number | null;
  ply: number;
  move_number: number;
  category: BlunderCategory;
  severity: ReviewSeverity;
  user_move: string;
  best_move: string;
  eval_before_cp: number | null;
  eval_after_cp: number | null;
  eval_drop_cp: number | null;
  fen_before: string;
  fen_after: string;
  explanation: string | null;
  training_hint: string | null;
  created_at: string;
};

export type DailyReviewUsageRow = {
  user_id: string;
  usage_date: string;
  reviews_used: number;
  created_at: string;
  updated_at: string;
};
