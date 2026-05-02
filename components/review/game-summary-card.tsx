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
import { useTranslations } from "next-intl";

export function GameSummaryCard({ bundle }: { bundle: ReviewBundle }) {
  const t = useTranslations("review");
  const { game, review, criticalMoments } = bundle;
  const totalCritical = criticalMoments.length;
  const userColor = game.player_color === "white" ? "white" : "black";
  const userResult = (() => {
    if (game.status === "checkmate" && game.winner) {
      return game.winner === userColor ? t("win") : t("loss");
    }
    if (game.status === "resigned") return t("loss");
    if (game.status === "stalemate" || game.status === "draw")
      return t("resultDraw");
    return t("unfinished");
  })();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{t("summaryTitle")}</CardTitle>
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
          {t(`result${capitalize(game.status)}`)} ·{" "}
          {t("moves", { count: game.move_count })} ·{" "}
          {t("vsStockfish", { difficulty: game.ai_difficulty })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label={t("criticalMoments")} value={String(totalCritical)} />
          <Stat
            label={t("blunders")}
            value={String(review.blunderCount)}
            tone="danger"
          />
          <Stat
            label={t("mistakes")}
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
            <span>{t("mainPattern")}</span>
            <BlunderPatternBadge category={review.mainCategory} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
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
