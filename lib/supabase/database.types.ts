import type { Database, Json } from "./database.generated";

type Tables = Database["public"]["Tables"];

export type { Database, Json };

export type AiDifficulty = Database["public"]["Enums"]["ai_difficulty"];
export type PlayerColor = Database["public"]["Enums"]["player_color"];
export type GameStatus = Database["public"]["Enums"]["game_status"];
export type MoveActor = Database["public"]["Enums"]["move_actor"];
export type ReviewSeverity = Database["public"]["Enums"]["review_severity"];
export type BlunderCategory = Database["public"]["Enums"]["blunder_category"];
export type City = Database["public"]["Enums"]["city"];

export type ProfileRow = Tables["profiles"]["Row"];
export type GameRow = Tables["games"]["Row"];
export type GameMoveRow = Tables["game_moves"]["Row"];
export type GameReviewRow = Tables["game_reviews"]["Row"];
export type CriticalMomentRow = Tables["critical_moments"]["Row"];
export type DailyReviewUsageRow = Tables["daily_review_usage"]["Row"];
export type LeaderboardSnapshotRow = Tables["leaderboard_snapshots"]["Row"];
export type DailyBlunderAttemptRow = Tables["daily_blunder_attempts"]["Row"];
export type WaitlistSignupRow = Tables["waitlist_signups"]["Row"];
