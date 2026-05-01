import type {
  BlunderCategory,
  ReviewSeverity,
} from "@/lib/supabase/database.types";

export type CoachLocale = "en" | "ru";

export type CoachInput = {
  locale: CoachLocale;
  fenBefore: string;
  fenAfter: string;
  userMove: string;
  bestMove: string | null;
  evalDropCp: number;
  candidateCategories: BlunderCategory[];
  preferredCategory: BlunderCategory;
  severity: ReviewSeverity;
  movedPiece: string | null;
  movedPieceSquare: string | null;
};

export type CoachOutput = {
  category: BlunderCategory;
  severity: ReviewSeverity;
  explanation: string;
  trainingHint: string;
  source: "openai" | "fallback";
};
