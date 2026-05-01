export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          city: Database["public"]["Enums"]["city"];
          default_difficulty: Database["public"]["Enums"]["ai_difficulty"];
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          city?: Database["public"]["Enums"]["city"];
          default_difficulty?: Database["public"]["Enums"]["ai_difficulty"];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          city?: Database["public"]["Enums"]["city"];
          default_difficulty?: Database["public"]["Enums"]["ai_difficulty"];
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          user_id: string;
          player_color: Database["public"]["Enums"]["player_color"];
          ai_difficulty: Database["public"]["Enums"]["ai_difficulty"];
          status: Database["public"]["Enums"]["game_status"];
          winner: Database["public"]["Enums"]["player_color"] | null;
          initial_fen: string;
          final_fen: string | null;
          pgn: string | null;
          move_count: number;
          started_at: string;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          player_color?: Database["public"]["Enums"]["player_color"];
          ai_difficulty?: Database["public"]["Enums"]["ai_difficulty"];
          status?: Database["public"]["Enums"]["game_status"];
          winner?: Database["public"]["Enums"]["player_color"] | null;
          initial_fen: string;
          final_fen?: string | null;
          pgn?: string | null;
          move_count?: number;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          player_color?: Database["public"]["Enums"]["player_color"];
          ai_difficulty?: Database["public"]["Enums"]["ai_difficulty"];
          status?: Database["public"]["Enums"]["game_status"];
          winner?: Database["public"]["Enums"]["player_color"] | null;
          initial_fen?: string;
          final_fen?: string | null;
          pgn?: string | null;
          move_count?: number;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      game_moves: {
        Row: {
          id: number;
          game_id: string;
          user_id: string;
          ply: number;
          move_number: number;
          color: Database["public"]["Enums"]["player_color"];
          actor: Database["public"]["Enums"]["move_actor"];
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
        Insert: {
          id?: number;
          game_id: string;
          user_id: string;
          ply: number;
          move_number: number;
          color: Database["public"]["Enums"]["player_color"];
          actor: Database["public"]["Enums"]["move_actor"];
          san: string;
          uci: string;
          from_square: string;
          to_square: string;
          promotion?: string | null;
          fen_before: string;
          fen_after: string;
          eval_cp?: number | null;
          eval_mate?: number | null;
          time_spent_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          game_id?: string;
          user_id?: string;
          ply?: number;
          move_number?: number;
          color?: Database["public"]["Enums"]["player_color"];
          actor?: Database["public"]["Enums"]["move_actor"];
          san?: string;
          uci?: string;
          from_square?: string;
          to_square?: string;
          promotion?: string | null;
          fen_before?: string;
          fen_after?: string;
          eval_cp?: number | null;
          eval_mate?: number | null;
          time_spent_ms?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      game_reviews: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          summary: string | null;
          main_category: Database["public"]["Enums"]["blunder_category"] | null;
          accuracy_score: number | null;
          blunder_count: number;
          mistake_count: number;
          training_goal: string | null;
          coach_locale: "en" | "ru";
          review_model: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id: string;
          summary?: string | null;
          main_category?:
            | Database["public"]["Enums"]["blunder_category"]
            | null;
          accuracy_score?: number | null;
          blunder_count?: number;
          mistake_count?: number;
          training_goal?: string | null;
          coach_locale?: "en" | "ru";
          review_model?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          user_id?: string;
          summary?: string | null;
          main_category?:
            | Database["public"]["Enums"]["blunder_category"]
            | null;
          accuracy_score?: number | null;
          blunder_count?: number;
          mistake_count?: number;
          training_goal?: string | null;
          coach_locale?: "en" | "ru";
          review_model?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      critical_moments: {
        Row: {
          id: string;
          review_id: string;
          game_id: string;
          user_id: string;
          move_id: number | null;
          ply: number;
          move_number: number;
          category: Database["public"]["Enums"]["blunder_category"];
          severity: Database["public"]["Enums"]["review_severity"];
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
        Insert: {
          id?: string;
          review_id: string;
          game_id: string;
          user_id: string;
          move_id?: number | null;
          ply: number;
          move_number: number;
          category: Database["public"]["Enums"]["blunder_category"];
          severity: Database["public"]["Enums"]["review_severity"];
          user_move: string;
          best_move: string;
          eval_before_cp?: number | null;
          eval_after_cp?: number | null;
          eval_drop_cp?: number | null;
          fen_before: string;
          fen_after: string;
          explanation?: string | null;
          training_hint?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          game_id?: string;
          user_id?: string;
          move_id?: number | null;
          ply?: number;
          move_number?: number;
          category?: Database["public"]["Enums"]["blunder_category"];
          severity?: Database["public"]["Enums"]["review_severity"];
          user_move?: string;
          best_move?: string;
          eval_before_cp?: number | null;
          eval_after_cp?: number | null;
          eval_drop_cp?: number | null;
          fen_before?: string;
          fen_after?: string;
          explanation?: string | null;
          training_hint?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_review_usage: {
        Row: {
          user_id: string;
          usage_date: string;
          reviews_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          usage_date?: string;
          reviews_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          usage_date?: string;
          reviews_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leaderboard_snapshots: {
        Row: {
          id: string;
          city: Database["public"]["Enums"]["city"];
          period_start: string;
          period_end: string;
          snapshot: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          city: Database["public"]["Enums"]["city"];
          period_start: string;
          period_end: string;
          snapshot?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          city?: Database["public"]["Enums"]["city"];
          period_start?: string;
          period_end?: string;
          snapshot?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_blunder_attempts: {
        Row: {
          id: string;
          user_id: string;
          moment_id: string;
          attempt_date: string;
          user_move: string | null;
          success: boolean;
          revealed_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          moment_id: string;
          attempt_date?: string;
          user_move?: string | null;
          success?: boolean;
          revealed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          moment_id?: string;
          attempt_date?: string;
          user_move?: string | null;
          success?: boolean;
          revealed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      waitlist_signups: {
        Row: {
          id: string;
          email: string;
          source: "pro" | "school";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: "pro" | "school";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: "pro" | "school";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<
      string,
      {
        Row: Record<string, unknown>;
        Relationships: [];
      }
    >;
    Functions: Record<
      string,
      {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    >;
    Enums: {
      ai_difficulty: "beginner" | "intermediate" | "advanced";
      blunder_category:
        | "Hanging Piece"
        | "Missed Tactic"
        | "King Safety"
        | "Tunnel Vision"
        | "Greedy Move"
        | "Time Panic"
        | "Opening Drift"
        | "Endgame Technique";
      city: "Almaty" | "Astana" | "Shymkent" | "Other";
      game_status:
        | "active"
        | "checkmate"
        | "stalemate"
        | "draw"
        | "resigned"
        | "abandoned";
      move_actor: "user" | "ai";
      player_color: "white" | "black";
      review_severity: "inaccuracy" | "mistake" | "blunder";
    };
    CompositeTypes: Record<string, never>;
  };
};
