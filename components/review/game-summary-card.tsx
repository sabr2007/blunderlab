import { BlunderPatternBadge } from "@/components/review/blunder-pattern-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReviewBundle } from "@/lib/review/types";

const RESULT_LABEL = {
  checkmate: "Checkmate",
  stalemate: "Stalemate",
  draw: "Draw",
  resigned: "Resigned",
  abandoned: "Abandoned",
  active: "Unfinished",
} as const;

export function GameSummaryCard({ bundle }: { bundle: ReviewBundle }) {
  const { game, review, criticalMoments } = bundle;
  const totalCritical = criticalMoments.length;
  const userColor = game.player_color === "white" ? "white" : "black";
  const userResult = (() => {
    if (game.status === "checkmate" && game.winner) {
      return game.winner === userColor ? "Win" : "Loss";
    }
    if (game.status === "resigned") return "Loss";
    if (game.status === "stalemate" || game.status === "draw") return "Draw";
    return "Unfinished";
  })();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Game review</CardTitle>
          <Badge
            variant={
              userResult === "Win"
                ? "success"
                : userResult === "Loss"
                  ? "danger"
                  : "default"
            }
          >
            {userResult}
          </Badge>
        </div>
        <CardDescription>
          {RESULT_LABEL[game.status]} · {game.move_count} moves · vs Stockfish (
          {game.ai_difficulty})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label="Critical moments" value={String(totalCritical)} />
          <Stat
            label="Blunders"
            value={String(review.blunderCount)}
            tone="danger"
          />
          <Stat
            label="Mistakes"
            value={String(review.mistakeCount)}
            tone="warning"
          />
        </div>
        {review.summary ? (
          <p className="rounded-md border border-border bg-surface/40 p-3 text-sm leading-relaxed">
            {review.summary}
          </p>
        ) : null}
        {review.mainCategory ? (
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <span>Main pattern</span>
            <BlunderPatternBadge category={review.mainCategory} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger" | "warning";
}) {
  const valueClass =
    tone === "danger"
      ? "text-danger"
      : tone === "warning"
        ? "text-warning"
        : "text-fg";

  return (
    <div className="rounded-md border border-border bg-bg/40 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">
        {label}
      </p>
      <p className={`mt-1 font-mono text-lg ${valueClass}`}>{value}</p>
    </div>
  );
}
