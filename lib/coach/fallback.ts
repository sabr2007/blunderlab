import type {
  BlunderCategory,
  ReviewSeverity,
} from "@/lib/supabase/database.types";
import type { CoachInput, CoachOutput } from "./types";

type TemplatePack = {
  explanation: (ctx: TemplateContext) => string;
  trainingHint: (ctx: TemplateContext) => string;
};

type TemplateContext = {
  locale: "en" | "ru";
  bestMove: string;
  userMove: string;
  piece: string;
  square: string;
  severity: ReviewSeverity;
};

const PIECE_NAMES: Record<string, { en: string; ru: string }> = {
  p: { en: "pawn", ru: "пешка" },
  n: { en: "knight", ru: "конь" },
  b: { en: "bishop", ru: "слон" },
  r: { en: "rook", ru: "ладья" },
  q: { en: "queen", ru: "ферзь" },
  k: { en: "king", ru: "король" },
};

const TEMPLATES: Record<BlunderCategory, TemplatePack> = {
  "Hanging Piece": {
    explanation: (ctx) =>
      ctx.locale === "ru"
        ? `Ваша ${ctx.piece} на ${ctx.square} осталась без защиты. Всегда проверяйте, защищена ли отыгранная фигура.`
        : `Your ${ctx.piece} on ${ctx.square} was left undefended. Always check that the piece you just moved is protected.`,
    trainingHint: (ctx) =>
      ctx.locale === "ru"
        ? "Перед каждым ходом задайте один вопрос: «Эта фигура защищена после моего хода?»"
        : "Before every move, ask one question: 'Is this piece defended after my move?'",
  },
  "Missed Tactic": {
    explanation: (ctx) =>
      ctx.locale === "ru"
        ? `В позиции был тактический удар: ${ctx.bestMove}. Сначала ищите форсированные ходы — шахи, взятия, угрозы.`
        : `There was a tactical shot here: ${ctx.bestMove}. Look for forcing moves — checks, captures, threats — before deciding.`,
    trainingHint: (ctx) =>
      ctx.locale === "ru"
        ? "Прежде чем ходить, проверь все шахи, взятия и угрозы — за себя и за соперника."
        : "Before moving, scan every check, capture, and threat — both yours and the opponent's.",
  },
  "King Safety": {
    explanation: (ctx) =>
      ctx.locale === "ru"
        ? `Ход ослабил вашего короля. ${ctx.bestMove} сохранил бы позицию короля.`
        : `This move weakened your king. ${ctx.bestMove} would have kept your king safe.`,
    trainingHint: (ctx) =>
      ctx.locale === "ru"
        ? "Перед атакующим ходом проверь, не открывает ли он линию или диагональ к твоему королю."
        : "Before any attacking move, check whether it opens a file or diagonal towards your own king.",
  },
  "Tunnel Vision": {
    explanation: (ctx) =>
      ctx.locale === "ru"
        ? `Вы продолжили атаку, но позиция требовала защиты. ${ctx.bestMove} устранил бы угрозу первым.`
        : `You continued your attack, but the position needed defense. ${ctx.bestMove} addressed the threat first.`,
    trainingHint: (ctx) =>
      ctx.locale === "ru"
        ? "Перед своим планом всегда смотри сильнейший ход соперника."
        : "Before pursuing your plan, always look at your opponent's strongest reply.",
  },
  "Greedy Move": {
    explanation: (ctx) =>
      ctx.locale === "ru"
        ? `Захват материала здесь стоил позиции. ${ctx.bestMove} удерживал баланс.`
        : `Grabbing material here cost you the position. ${ctx.bestMove} kept the balance.`,
    trainingHint: (ctx) =>
      ctx.locale === "ru"
        ? "Перед взятием — посчитай, что ты теряешь по позиции, а не только по материалу."
        : "Before any capture, count what you lose in position, not just in material.",
  },
  "Time Panic": {
    explanation: (ctx) =>
      ctx.locale === "ru"
        ? `Похоже на быстрое решение. Замедление позволило бы найти ${ctx.bestMove}.`
        : `This looks like a quick decision. Slowing down would have revealed ${ctx.bestMove}.`,
    trainingHint: () =>
      "Take a deep breath before each critical move and recheck the threats.",
  },
  "Opening Drift": {
    explanation: (ctx) =>
      ctx.locale === "ru"
        ? `Ранний выход из стандартного развития. ${ctx.bestMove} сохраняет нормальное развитие.`
        : `Early move out of book. ${ctx.bestMove} keeps standard development.`,
    trainingHint: (ctx) =>
      ctx.locale === "ru"
        ? "В первые 10 ходов сначала развивай фигуры и обеспечь короля."
        : "In the first 10 moves, develop pieces first and secure your king.",
  },
  "Endgame Technique": {
    explanation: (ctx) =>
      ctx.locale === "ru"
        ? `Был более точный план: ${ctx.bestMove}. В эндшпиле каждое поле имеет значение.`
        : `There's a more precise method: ${ctx.bestMove}. Endgame squares matter.`,
    trainingHint: (ctx) =>
      ctx.locale === "ru"
        ? "В эндшпиле сначала активизируй короля и считай темпы пешек."
        : "In the endgame, activate your king first and count pawn tempi.",
  },
};

export function getFallbackCoachOutput(input: CoachInput): CoachOutput {
  const piece = input.movedPiece
    ? (PIECE_NAMES[input.movedPiece]?.[input.locale] ?? input.movedPiece)
    : input.locale === "ru"
      ? "фигура"
      : "piece";

  const ctx: TemplateContext = {
    locale: input.locale,
    bestMove: input.bestMove ?? "the engine's recommendation",
    userMove: input.userMove,
    piece,
    square: input.movedPieceSquare ?? "—",
    severity: input.severity,
  };

  const pack = TEMPLATES[input.preferredCategory];

  return {
    category: input.preferredCategory,
    severity: input.severity,
    explanation: pack.explanation(ctx),
    trainingHint: pack.trainingHint(ctx),
    source: "fallback",
  };
}

export const COACH_TEMPLATES = TEMPLATES;
