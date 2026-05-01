"use client";

import {
  type DailyBlunderPayload,
  type DailyBlunderResult,
  revealDailyBlunderAction,
  submitDailyBlunderAttemptAction,
} from "@/app/(service)/daily-blunder/actions";
import { ChessBoardWrapper } from "@/components/chess/chess-board-wrapper";
import { BlunderPatternBadge } from "@/components/review/blunder-pattern-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLegalTargetSquares, isSquare, tryMove } from "@/lib/chess/rules";
import type { Square } from "chess.js";
import { CheckCircle2, Eye, Loader2, XCircle } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

export function DailyBlunderTrainer({
  payload,
}: {
  payload: DailyBlunderPayload;
}) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [previewFen, setPreviewFen] = useState(payload.moment.fen_before);
  const [answer, setAnswer] = useState<string | null>(
    payload.attempt.user_move,
  );
  const [result, setResult] = useState<DailyBlunderResult | null>(() => {
    if (payload.attempt.success || payload.attempt.revealed_at) {
      return {
        kind: "ok",
        success: payload.attempt.success,
        userMove: payload.attempt.user_move ?? "",
        correctMove: payload.moment.best_move,
        explanation: payload.moment.explanation ?? "",
        trainingHint: payload.moment.training_hint,
      };
    }

    if (payload.attempt.user_move) {
      return {
        kind: "ok",
        success: false,
        userMove: payload.attempt.user_move,
        correctMove: payload.moment.best_move,
        explanation: payload.moment.explanation ?? "",
        trainingHint: payload.moment.training_hint,
      };
    }

    return null;
  });
  const [pending, startTransition] = useTransition();
  const turn = payload.moment.fen_before.split(" ")[1] === "b" ? "b" : "w";
  const bestMoveSquares = parseUci(payload.moment.best_move);
  const userMoveSquares = parseUci(answer);
  const solvedOrRevealed = result?.kind === "ok";

  const ageLabel = useMemo(() => {
    const ageMs = Date.now() - new Date(payload.moment.created_at).getTime();
    const days = Math.max(0, Math.floor(ageMs / (24 * 60 * 60 * 1000)));
    if (days === 0) return "from a recent review";
    if (days === 1) return "from yesterday's review";
    return `from ${days} days ago`;
  }, [payload.moment.created_at]);

  function chooseMove(from: string, to: string) {
    if (!isSquare(from) || !isSquare(to) || solvedOrRevealed) {
      return false;
    }

    const moved = tryMove(
      payload.moment.fen_before,
      { from, to, promotion: "q" },
      "user",
    );

    if (!moved.ok) {
      return false;
    }

    setPreviewFen(moved.snapshot.fen);
    setAnswer(moved.record.uci);
    setSelectedSquare(null);
    setLegalTargets([]);
    return true;
  }

  function selectSquare(square: Square) {
    if (solvedOrRevealed) {
      return;
    }

    if (selectedSquare && legalTargets.includes(square)) {
      chooseMove(selectedSquare, square);
      return;
    }

    setSelectedSquare(square);
    setLegalTargets(getLegalTargetSquares(payload.moment.fen_before, square));
  }

  function submit() {
    if (!answer) return;

    startTransition(async () => {
      const next = await submitDailyBlunderAttemptAction(
        payload.attempt.id,
        answer,
      );
      setResult(next);
    });
  }

  function reveal() {
    startTransition(async () => {
      const next = await revealDailyBlunderAction(payload.attempt.id);
      setResult(next);
    });
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Find the move you missed</CardTitle>
            <BlunderPatternBadge category={payload.moment.category} />
          </div>
          <CardDescription>
            Move {payload.moment.move_number} · {ageLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChessBoardWrapper
            fen={previewFen}
            disabled={solvedOrRevealed}
            orientation="white"
            selectedSquare={selectedSquare}
            legalTargets={legalTargets}
            bestMove={solvedOrRevealed ? bestMoveSquares : null}
            lastMove={userMoveSquares}
            onDrop={({ sourceSquare, targetSquare }) =>
              targetSquare ? chooseMove(sourceSquare, targetSquare) : false
            }
            onSquareClick={({ square }) => {
              if (isSquare(square)) selectSquare(square);
            }}
            canDragPiece={({ piece }) =>
              !solvedOrRevealed && piece.pieceType.startsWith(turn)
            }
          />
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Your answer</CardTitle>
            <CardDescription>
              Submit the best move, not the move you actually played.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MovePanel label="Selected" value={answer ?? "—"} />
              <MovePanel
                label="Best move"
                value={solvedOrRevealed ? payload.moment.best_move : "Hidden"}
                tone={solvedOrRevealed ? "success" : "muted"}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!answer || pending || solvedOrRevealed}
                onClick={submit}
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Submit move
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={pending || solvedOrRevealed}
                onClick={reveal}
              >
                <Eye className="size-4" />
                Reveal
              </Button>
            </div>
          </CardContent>
        </Card>

        {result?.kind === "ok" ? (
          <Card
            className={
              result.success
                ? "border-success/40 bg-success/5"
                : "border-warning/40 bg-warning/5"
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="size-5 text-success" />
                ) : (
                  <XCircle className="size-5 text-warning" />
                )}
                {result.success ? "Solved" : "Review the idea"}
              </CardTitle>
              <CardDescription>
                Correct move: {result.correctMove}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p>{result.explanation}</p>
              {result.trainingHint ? (
                <p className="rounded-md border border-border bg-bg/40 p-3 text-fg-muted">
                  {result.trainingHint}
                </p>
              ) : null}
              <Badge variant={result.success ? "success" : "warning"}>
                {result.success ? "Streak credited" : "No streak credit"}
              </Badge>
            </CardContent>
          </Card>
        ) : null}

        {result?.kind === "error" ? (
          <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {result.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function MovePanel({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "success";
}) {
  return (
    <div className="rounded-md border border-border bg-bg/40 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-base ${
          tone === "success" ? "text-success" : "text-fg"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function parseUci(
  value: string | null | undefined,
): { from: Square; to: Square } | null {
  if (!value) return null;
  const match = /^([a-h][1-8])([a-h][1-8])/.exec(value);
  if (!match) return null;
  return { from: match[1] as Square, to: match[2] as Square };
}
