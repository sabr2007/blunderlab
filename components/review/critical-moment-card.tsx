"use client";

import { ChessBoardWrapper } from "@/components/chess/chess-board-wrapper";
import { AICoachCard } from "@/components/review/ai-coach-card";
import { BlunderPatternBadge } from "@/components/review/blunder-pattern-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReviewCriticalMoment } from "@/lib/review/types";
import type { Square } from "chess.js";
import { Crosshair } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  moment: ReviewCriticalMoment;
  index: number;
  total: number;
  orientation: "white" | "black";
};

export function CriticalMomentCard({
  moment,
  index,
  total,
  orientation,
}: Props) {
  const t = useTranslations("review");
  const userMoveSquares = parseUci(moment.userMove);
  const bestMoveSquares = parseUci(moment.bestMove);

  return (
    <Card className="overflow-hidden" data-testid="critical-moment-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crosshair className="size-4 text-accent" />
            {t("criticalMoment", { index: index + 1, total })}
          </CardTitle>
          <Badge variant={severityVariant(moment.severity)}>
            {moment.severity}
          </Badge>
        </div>
        <CardDescription>
          {t("move", {
            move: moment.moveNumber,
            drop: dropLabel(moment.evalDropCp, t),
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChessBoardWrapper
          fen={moment.fenBefore}
          disabled
          orientation={orientation}
          lastMove={
            userMoveSquares
              ? { from: userMoveSquares.from, to: userMoveSquares.to }
              : null
          }
          bestMove={
            bestMoveSquares
              ? { from: bestMoveSquares.from, to: bestMoveSquares.to }
              : null
          }
          blunderSquare={userMoveSquares?.to ?? null}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-fg-muted">{t("pattern")}</span>
          <BlunderPatternBadge category={moment.category} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <MoveBlock
            label={t("youPlayed")}
            value={moment.userMove}
            tone="danger"
          />
          <MoveBlock
            label={t("bestMove")}
            value={moment.bestMove}
            tone="success"
          />
        </div>
        <AICoachCard explanation={moment.explanation} />
        {moment.trainingHint ? (
          <div className="rounded-md border border-dashed border-border bg-surface/40 p-3 text-sm text-fg-muted">
            {moment.trainingHint}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MoveBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "danger" | "success";
}) {
  const accent =
    tone === "danger"
      ? "border-danger/40 bg-danger/10 text-danger"
      : "border-success/40 bg-success/10 text-success";

  return (
    <div className={`rounded-md border p-3 ${accent}`}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 font-mono text-base">{value || "—"}</p>
    </div>
  );
}

function severityVariant(severity: ReviewCriticalMoment["severity"]) {
  if (severity === "blunder") return "danger" as const;
  if (severity === "mistake") return "warning" as const;
  return "default" as const;
}

function dropLabel(
  dropCp: number | null,
  t: ReturnType<typeof useTranslations<"review">>,
) {
  if (dropCp === null) return t("evalUnknown");
  return t("evalDrop", { pawns: (dropCp / 100).toFixed(1) });
}

function parseUci(
  uci: string | null | undefined,
): { from: Square; to: Square } | null {
  if (!uci) return null;
  const match = /^([a-h][1-8])([a-h][1-8])/.exec(uci);
  if (!match) return null;
  return { from: match[1] as Square, to: match[2] as Square };
}
