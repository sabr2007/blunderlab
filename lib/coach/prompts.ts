import type { BlunderCategory } from "@/lib/supabase/database.types";
import type { CoachInput } from "./types";

const CATEGORIES: BlunderCategory[] = [
  "Hanging Piece",
  "Missed Tactic",
  "King Safety",
  "Tunnel Vision",
  "Greedy Move",
  "Time Panic",
  "Opening Drift",
  "Endgame Technique",
];

export const COACH_RESPONSE_SCHEMA = {
  name: "BlunderLabCoachResponse",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      category: { type: "string", enum: CATEGORIES },
      severity: {
        type: "string",
        enum: ["inaccuracy", "mistake", "blunder"],
      },
      explanation: { type: "string", minLength: 40, maxLength: 280 },
      trainingHint: { type: "string", minLength: 20, maxLength: 180 },
    },
    required: ["category", "severity", "explanation", "trainingHint"],
  },
  strict: true,
} as const;

export function buildSystemPrompt(locale: "en" | "ru"): string {
  if (locale === "ru") {
    return [
      "Ты BlunderLab Coach — шахматный тренер, который объясняет ошибки простыми словами.",
      "Голос: точный, поддерживающий, без унижения и без снисходительности.",
      "Манера: спокойный шахматный наставник — наблюдательный, конкретный, слегка аналитичный.",
      "Не начинай с фраз вроде «Отличный ход» или «Не переживай». Без пустых утешений.",
      "Тебе уже передали проверенные данные: лучший ход, eval drop, и список кандидатов категорий ошибки.",
      "ТЫ НЕ АНАЛИЗИРУЕШЬ позицию сам — только формулируешь объяснение и совет, опираясь на вход.",
      "Никогда не выдумывай ходы и не утверждай новые. Используй переданные `bestMove` и `userMove`.",
      "Пример RU-ответа: объяснение должно звучать как «Ты продолжил атаку, но позиция сначала требовала защиты через bestMove».",
      "Объяснение 1–2 короткими предложениями.",
      "Финальный ответ — строго JSON по схеме. Никакого пред- или послетекста.",
    ].join("\n");
  }

  return [
    "You are BlunderLab Coach — a chess coach who explains mistakes in plain language.",
    "Voice: precise, supportive, never humiliating.",
    "Style: calm chess mentor — observant, concrete, slightly analytical.",
    "Do not open with filler like 'Great move' or 'Don't worry'.",
    "You receive verified analysis: best move, eval drop, candidate categories.",
    "You DO NOT analyse the position yourself. Use only the inputs to form the explanation.",
    "Never invent moves; refer only to the supplied bestMove and userMove.",
    "Explanation is 1–2 short sentences.",
    "Reply strictly as JSON matching the schema. No prefix or suffix text.",
  ].join("\n");
}

export function buildUserPrompt(input: CoachInput): string {
  return JSON.stringify(
    {
      locale: input.locale,
      fenBefore: input.fenBefore,
      fenAfter: input.fenAfter,
      userMove: input.userMove,
      bestMove: input.bestMove,
      evalDropCp: input.evalDropCp,
      candidateCategories: input.candidateCategories,
      preferredCategory: input.preferredCategory,
      severity: input.severity,
      movedPiece: input.movedPiece,
      movedPieceSquare: input.movedPieceSquare,
    },
    null,
    2,
  );
}
