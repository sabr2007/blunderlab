"use client";

import { submitReviewAction } from "@/app/review/actions";
import { CriticalMomentCard } from "@/components/review/critical-moment-card";
import { GameSummaryCard } from "@/components/review/game-summary-card";
import { TrainingGoalCard } from "@/components/review/training-goal-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { StockfishAnalyzer } from "@/lib/chess/analysis";
import { selectCriticalMoments } from "@/lib/chess/critical-moments";
import {
  type PipelineProgress,
  analyzeUserMoves,
  pickedMovedPiece,
} from "@/lib/chess/review-pipeline";
import type {
  CriticalMomentInput,
  GameForReview,
  ReviewBundle,
} from "@/lib/review/types";
import { ensureAnonymousUser } from "@/lib/supabase/anonymous";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

type ReviewViewProps = {
  gameId: string;
  initialBundle: ReviewBundle | null;
  game: GameForReview;
};

type Phase =
  | { kind: "loading"; progress: PipelineProgress }
  | { kind: "ready"; bundle: ReviewBundle }
  | { kind: "rate_limited"; resetAt: string }
  | { kind: "error"; message: string }
  | { kind: "empty" };

const INITIAL_PROGRESS: PipelineProgress = {
  phase: "parsing",
  done: 0,
  total: 0,
};

export function ReviewView({ gameId, initialBundle, game }: ReviewViewProps) {
  const locale = useLocale() === "ru" ? "ru" : "en";
  const t = useTranslations("review");
  const initialPhase: Phase = initialBundle
    ? { kind: "ready", bundle: initialBundle }
    : !game.pgn
      ? {
          kind: "error",
          message: t("noMoves"),
        }
      : { kind: "loading", progress: INITIAL_PROGRESS };

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const ranRef = useRef(false);

  useEffect(() => {
    if (initialBundle) {
      return;
    }

    if (!game.pgn) {
      return;
    }

    if (ranRef.current) {
      return;
    }

    ranRef.current = true;
    void runPipeline({ gameId, game, locale, setPhase });
  }, [gameId, game, initialBundle, locale]);

  if (phase.kind === "ready") {
    return <ReviewLayout bundle={phase.bundle} />;
  }

  if (phase.kind === "rate_limited") {
    return <RateLimitNotice resetAt={phase.resetAt} />;
  }

  if (phase.kind === "error") {
    return <ReviewErrorPanel message={phase.message} />;
  }

  return (
    <ProgressPanel
      progress={phase.kind === "loading" ? phase.progress : INITIAL_PROGRESS}
    />
  );
}

async function runPipeline({
  gameId,
  game,
  locale,
  setPhase,
}: {
  gameId: string;
  game: GameForReview;
  locale: "en" | "ru";
  setPhase: (phase: Phase) => void;
}) {
  if (!game.pgn) {
    setPhase({ kind: "empty" });
    return;
  }

  const userColor = game.player_color;

  const analyzer = new StockfishAnalyzer();

  try {
    await ensureAnonymousUser();

    const analyzed = await analyzeUserMoves(
      analyzer,
      game.pgn,
      userColor,
      (progress) => {
        setPhase({ kind: "loading", progress });
      },
    );

    setPhase({
      kind: "loading",
      progress: { phase: "scoring", done: 0, total: analyzed.length },
    });

    const moments = selectCriticalMoments(analyzed, userColor);

    const inputs: CriticalMomentInput[] = moments.map((moment) => ({
      ply: moment.ply.ply,
      moveNumber: moment.ply.moveNumber,
      color: moment.ply.color,
      san: moment.ply.san,
      uci: moment.ply.uci,
      from: moment.ply.from,
      to: moment.ply.to,
      promotion: moment.ply.promotion ?? null,
      fenBefore: moment.ply.fenBefore,
      fenAfter: moment.ply.fenAfter,
      bestMove: moment.ply.bestMove,
      bestMoveSan: moment.ply.bestMoveSan,
      evalBeforeCp: moment.ply.evalBefore.cp,
      evalAfterCp: moment.ply.evalAfter.cp,
      evalBeforeMate: moment.ply.evalBefore.mate,
      evalAfterMate: moment.ply.evalAfter.mate,
      evalDropCp: moment.evalDropCp,
      movedPiece: pickedMovedPiece(moment.ply.uci, moment.ply.fenBefore),
    }));

    setPhase({
      kind: "loading",
      progress: { phase: "submitting", done: 0, total: inputs.length },
    });

    const result = await submitReviewAction({
      gameId,
      userColor,
      locale,
      criticalMoments: inputs,
    });

    if (result.kind === "ok") {
      setPhase({ kind: "ready", bundle: result.bundle });
      return;
    }

    if (result.kind === "rate_limited") {
      setPhase({ kind: "rate_limited", resetAt: result.resetAt });
      return;
    }

    setPhase({ kind: "error", message: result.message });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : locale === "ru"
          ? "Пайплайн ревью сломался."
          : "Review pipeline failed.";
    setPhase({ kind: "error", message });
  } finally {
    analyzer.destroy();
  }
}

function ReviewLayout({ bundle }: { bundle: ReviewBundle }) {
  const t = useTranslations("review");
  const orientation = bundle.game.player_color === "white" ? "white" : "black";

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-15" />
      <div className="container py-6 md:py-10">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              {t("title")}
            </h1>
          </div>
          <Link
            href="/play"
            className="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            {"<"} {t("backToPlay")}
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="grid gap-5">
            {bundle.criticalMoments.length === 0 ? (
              <CleanGamePanel summary={bundle.review.summary ?? null} />
            ) : (
              bundle.criticalMoments.map((moment, index) => (
                <CriticalMomentCard
                  key={moment.id}
                  moment={moment}
                  index={index}
                  total={bundle.criticalMoments.length}
                  orientation={orientation}
                />
              ))
            )}
          </div>

          <div className="grid gap-5 lg:sticky lg:top-6 lg:self-start">
            <GameSummaryCard bundle={bundle} />
            {bundle.review.trainingGoal ? (
              <TrainingGoalCard
                reviewId={bundle.review.id}
                trainingGoal={bundle.review.trainingGoal}
              />
            ) : null}
            {bundle.review.reviewModel === "fallback" &&
            bundle.criticalMoments.length > 0 ? (
              <p className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
                {t("fallback")}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function CleanGamePanel({ summary }: { summary: string | null }) {
  const t = useTranslations("review");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cleanTitle")}</CardTitle>
        <CardDescription>{t("cleanDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-fg-muted">
        {summary ?? t("cleanFallback")}
      </CardContent>
    </Card>
  );
}

function ProgressPanel({ progress }: { progress: PipelineProgress }) {
  const t = useTranslations("review");
  const percent =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  const message = useMemo(() => {
    if (progress.phase === "parsing") return t("parsing");
    if (progress.phase === "analyzing")
      return t("analyzing", { done: progress.done, total: progress.total });
    if (progress.phase === "scoring") return t("scoring");
    if (progress.phase === "submitting") return t("submitting");
    return t("finishing");
  }, [progress, t]);

  return (
    <main className="min-h-screen bg-bg">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin text-accent" />
              {t("building")}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-3 text-right font-mono text-xs text-fg-muted">
              {percent}%
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function RateLimitNotice({ resetAt }: { resetAt: string }) {
  const t = useTranslations("review");
  const reset = new Date(resetAt);

  return (
    <main className="min-h-screen bg-bg">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="size-5" />
              {t("limitTitle")}
            </CardTitle>
            <CardDescription>
              {t("limitText", { time: reset.toUTCString() })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-muted">{t("proLift")}</p>
            <Button asChild variant="secondary" className="mt-4 w-full">
              <Link href="/pro">{t("viewPro")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function ReviewErrorPanel({ message }: { message: string }) {
  const t = useTranslations("review");

  return (
    <main className="min-h-screen bg-bg">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md border-danger/40 bg-danger/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="size-5" />
              {t("unavailable")}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/play">
                <RotateCcw className="size-4" />
                {t("playAnother")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
