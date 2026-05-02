"use client";

import { finalizeGameAction, startGameAction } from "@/app/play/actions";
import { ChessBoardWrapper } from "@/components/chess/chess-board-wrapper";
import { TrainingModes } from "@/components/training/training-modes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ENGINE_PRESETS, StockfishEngine } from "@/lib/chess/engine";
import {
  STARTING_FEN,
  buildPgn,
  createGame,
  getLegalTargetSquares,
  getSnapshotFromFen,
  isSquare,
  tryMove,
  tryUciMove,
} from "@/lib/chess/rules";
import type { AiDifficulty, GameStatus, MoveRecord } from "@/lib/chess/types";
import { ensureAnonymousUser } from "@/lib/supabase/anonymous";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import type { ActiveTrainingGoal } from "@/lib/training/progress";
import type { Square } from "chess.js";
import {
  Activity,
  Brain,
  CheckCircle2,
  Goal,
  Loader2,
  RotateCcw,
  Swords,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DIFFICULTIES: AiDifficulty[] = ["beginner", "intermediate", "advanced"];

// tryMove builds each MoveRecord from a freshly-instantiated chess.js position
// (no prior history), so its `ply` and `moveNumber` always come back as 1.
// Re-stamp them with the real game ply before persisting — otherwise the
// game_moves unique (game_id, ply) constraint blows up at finalize time.
function withGamePly(record: MoveRecord, priorMoves: number): MoveRecord {
  const ply = priorMoves + 1;
  return { ...record, ply, moveNumber: Math.ceil(ply / 2) };
}

type PersistenceState =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "ready"; gameId: string }
  | { kind: "saving"; gameId: string }
  | { kind: "saved"; gameId: string }
  | { kind: "disabled"; reason: string };

export function PlayView({
  activeGoal,
}: {
  activeGoal?: ActiveTrainingGoal | null;
}) {
  const [fen, setFen] = useState(STARTING_FEN);
  const [difficulty, setDifficulty] = useState<AiDifficulty>("beginner");
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [goalDismissed, setGoalDismissed] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [engineState, setEngineState] = useState<
    "idle" | "thinking" | "fallback"
  >("idle");
  const [forcedStatus, setForcedStatus] = useState<GameStatus | null>(null);
  const [persistence, setPersistence] = useState<PersistenceState>(() =>
    getSupabasePublicConfig().isConfigured
      ? { kind: "idle" }
      : {
          kind: "disabled",
          reason: "Supabase env not set — review storage is disabled.",
        },
  );

  const engineRef = useRef<StockfishEngine | null>(null);
  const requestIdRef = useRef(0);
  const movesRef = useRef<MoveRecord[]>([]);
  const persistenceRef = useRef<PersistenceState>({ kind: "idle" });
  const finalizedRef = useRef(false);
  const sessionReadyRef = useRef<Promise<void> | null>(null);
  const startGamePromiseRef = useRef<Promise<string | null> | null>(null);

  movesRef.current = moves;
  persistenceRef.current = persistence;

  const snapshot = useMemo(() => getSnapshotFromFen(fen), [fen]);
  const gameStatus = forcedStatus ?? snapshot.status;
  const isUserTurn =
    snapshot.turn === "w" &&
    gameStatus === "active" &&
    engineState !== "thinking";
  const lastMove = moves.at(-1) ?? null;

  useEffect(() => {
    engineRef.current = new StockfishEngine();

    return () => {
      requestIdRef.current += 1;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (persistence.kind !== "idle") {
      return;
    }

    if (sessionReadyRef.current) {
      return;
    }

    sessionReadyRef.current = ensureAnonymousUser()
      .then(() => undefined)
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "anonymous sign-in failed";
        setPersistence({ kind: "disabled", reason: message });
      });
  }, [persistence.kind]);

  const ensureGameStarted = useCallback(async (): Promise<string | null> => {
    const current = persistenceRef.current;

    if (
      current.kind === "ready" ||
      current.kind === "saving" ||
      current.kind === "saved"
    ) {
      return current.gameId;
    }

    if (current.kind === "disabled") {
      return null;
    }

    if (startGamePromiseRef.current) {
      return startGamePromiseRef.current;
    }

    setPersistence({ kind: "starting" });

    const promise = (async () => {
      try {
        await sessionReadyRef.current;

        const result = await startGameAction({
          difficulty,
          playerColor: "white",
          initialFen: STARTING_FEN,
        });

        if (!result.ok) {
          setPersistence({ kind: "disabled", reason: result.error });
          return null;
        }

        setPersistence({ kind: "ready", gameId: result.data.gameId });
        return result.data.gameId;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "failed to start game";
        setPersistence({ kind: "disabled", reason: message });
        return null;
      } finally {
        startGamePromiseRef.current = null;
      }
    })();

    startGamePromiseRef.current = promise;
    return promise;
  }, [difficulty]);

  function restart() {
    requestIdRef.current += 1;
    finalizedRef.current = false;
    setFen(STARTING_FEN);
    setMoves([]);
    setSelectedSquare(null);
    setLegalTargets([]);
    setForcedStatus(null);
    setEngineState("idle");

    if (persistenceRef.current.kind !== "disabled") {
      setPersistence({ kind: "idle" });
    }
  }

  function resign() {
    requestIdRef.current += 1;
    setForcedStatus("resigned");
    setSelectedSquare(null);
    setLegalTargets([]);
    setEngineState("idle");
  }

  function selectSquare(square: Square) {
    const chess = createGame(fen);
    const piece = chess.get(square);

    if (!piece || piece.color !== "w" || !isUserTurn) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    setSelectedSquare(square);
    setLegalTargets(getLegalTargetSquares(fen, square));
  }

  function makeUserMove(from: string, to: string) {
    if (!isUserTurn || !isSquare(from) || !isSquare(to)) {
      return false;
    }

    const result = tryMove(fen, { from, to, promotion: "q" }, "user");

    if (!result.ok) {
      return false;
    }

    setFen(result.snapshot.fen);
    setMoves((current) => [
      ...current,
      withGamePly(result.record, current.length),
    ]);
    setSelectedSquare(null);
    setLegalTargets([]);

    if (movesRef.current.length === 0) {
      void ensureGameStarted();
    }

    if (result.snapshot.status === "active") {
      void makeEngineMove(result.snapshot.fen);
    }

    return true;
  }

  async function makeEngineMove(nextFen: string) {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setEngineState("thinking");

    try {
      const result = await engineRef.current?.bestMove(nextFen, difficulty);

      if (requestId !== requestIdRef.current || !result?.bestMove) {
        return;
      }

      const applied = tryUciMove(nextFen, result.bestMove, "ai");

      if (applied.ok) {
        setFen(applied.snapshot.fen);
        setMoves((current) => [
          ...current,
          withGamePly(applied.record, current.length),
        ]);
        setEngineState("idle");
        return;
      }

      makeFallbackEngineMove(nextFen);
    } catch {
      if (requestId === requestIdRef.current) {
        makeFallbackEngineMove(nextFen);
      }
    }
  }

  function makeFallbackEngineMove(nextFen: string) {
    const chess = createGame(nextFen);
    const legalMoves = chess.moves({ verbose: true });
    const fallback = legalMoves[0];

    if (!fallback) {
      setEngineState("idle");
      return;
    }

    const applied = tryMove(
      nextFen,
      {
        from: fallback.from,
        to: fallback.to,
        promotion: fallback.promotion ?? "q",
      },
      "ai",
    );

    if (applied.ok) {
      setFen(applied.snapshot.fen);
      setMoves((current) => [
        ...current,
        withGamePly(applied.record, current.length),
      ]);
    }

    setEngineState("fallback");
    window.setTimeout(() => setEngineState("idle"), 1200);
  }

  // Finalize game (server-side persistence) when the game ends.
  useEffect(() => {
    if (gameStatus === "active") {
      return;
    }

    if (finalizedRef.current) {
      return;
    }

    const persistenceNow = persistenceRef.current;

    if (persistenceNow.kind !== "ready" && persistenceNow.kind !== "starting") {
      return;
    }

    finalizedRef.current = true;

    void (async () => {
      const gameId = await ensureGameStarted();

      if (!gameId) {
        return;
      }

      setPersistence({ kind: "saving", gameId });

      const replay = movesRef.current.map((move) => ({
        from: move.from,
        to: move.to,
        promotion: move.promotion ?? null,
      }));

      const built =
        replay.length > 0 ? buildPgn(replay) : { pgn: "", finalFen: fen };

      const winner =
        gameStatus === "checkmate"
          ? snapshot.turn === "w"
            ? "black"
            : "white"
          : gameStatus === "resigned"
            ? "black"
            : null;

      const result = await finalizeGameAction({
        gameId,
        status: gameStatus,
        winner,
        finalFen: built.finalFen,
        pgn: built.pgn,
        moves: movesRef.current.map((move) => ({
          ply: move.ply,
          moveNumber: move.moveNumber,
          color: move.color,
          actor: move.actor,
          san: move.san,
          uci: move.uci,
          from: move.from,
          to: move.to,
          promotion: move.promotion ?? null,
          fenBefore: move.fenBefore,
          fenAfter: move.fenAfter,
        })),
      });

      if (!result.ok) {
        setPersistence({ kind: "disabled", reason: result.error });
        return;
      }

      setPersistence({ kind: "saved", gameId });
    })();
  }, [gameStatus, fen, snapshot.turn, ensureGameStarted]);

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-20" />
      <div className="container py-6 md:py-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Phase 2 · Play & Review
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
              Play against Stockfish
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((level) => (
              <Button
                key={level}
                type="button"
                variant={difficulty === level ? "default" : "secondary"}
                size="sm"
                disabled={engineState === "thinking" || moves.length > 0}
                onClick={() => setDifficulty(level)}
              >
                {ENGINE_PRESETS[level].label}
              </Button>
            ))}
          </div>
        </header>

        {activeGoal && !goalDismissed ? (
          <section className="mb-5 rounded-md border border-success/35 bg-success/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-success/15 text-success">
                  <Goal className="size-4" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-success">
                      Current goal
                    </p>
                    {activeGoal.category ? (
                      <Badge variant="success">{activeGoal.category}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg">
                    {activeGoal.text}
                  </p>
                  <p className="mt-2 text-xs text-fg-muted">
                    Carried from your latest review. Use this game to test one
                    better habit.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-start"
                aria-label="Dismiss current training goal"
                onClick={() => setGoalDismissed(true)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </section>
        ) : null}

        <div className="mb-6">
          <TrainingModes
            activeGoalId={activeGoal?.id}
            activeGoalText={activeGoal?.text}
          />
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <ChessBoardWrapper
            fen={fen}
            disabled={!isUserTurn}
            selectedSquare={selectedSquare}
            legalTargets={legalTargets}
            lastMove={
              lastMove ? { from: lastMove.from, to: lastMove.to } : null
            }
            onDrop={({ sourceSquare, targetSquare }) => {
              if (!targetSquare) {
                return false;
              }

              return makeUserMove(sourceSquare, targetSquare);
            }}
            onSquareClick={({ square }) => {
              if (!isSquare(square)) {
                return;
              }

              if (selectedSquare && legalTargets.includes(square)) {
                makeUserMove(selectedSquare, square);
                return;
              }

              selectSquare(square);
            }}
            canDragPiece={({ piece }) =>
              isUserTurn && piece.pieceType.startsWith("w")
            }
          />

          <aside className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Game status</CardTitle>
                  <StatusBadge status={gameStatus} engineState={engineState} />
                </div>
                <CardDescription>
                  Legal moves are validated by chess.js. AI responses come from
                  the Stockfish worker.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric
                    label="Turn"
                    value={snapshot.turn === "w" ? "White" : "Black"}
                  />
                  <Metric label="Moves" value={String(moves.length)} />
                  <Metric
                    label="Difficulty"
                    value={ENGINE_PRESETS[difficulty].label}
                  />
                  <Metric
                    label="Check"
                    value={snapshot.isCheck ? "Yes" : "No"}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={restart}>
                    <RotateCcw /> Restart
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={gameStatus !== "active"}
                    onClick={resign}
                  >
                    <Swords /> Resign
                  </Button>
                </div>

                {persistence.kind === "disabled" ? (
                  <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                    Persistence offline: {persistence.reason}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {gameStatus !== "active" ? (
              <Card className="border-accent/40 bg-accent/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-success" />
                    Game finished
                  </CardTitle>
                  <CardDescription>
                    Engine analysis runs on the review screen — the AI Coach
                    waits there.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewCta persistence={persistence} />
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Move history</CardTitle>
                <CardDescription>
                  Current PGN source for persistence and review.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {moves.length > 0 ? (
                  <ol className="max-h-72 space-y-2 overflow-auto pr-1 text-sm">
                    {moves.map((move) => (
                      <li
                        key={`${move.ply}-${move.uci}`}
                        className="flex items-center justify-between rounded-md border border-border bg-bg/40 px-3 py-2"
                      >
                        <span className="font-mono text-xs text-fg-muted">
                          {move.moveNumber}.{move.color === "black" ? ".." : ""}
                        </span>
                        <span>{move.san}</span>
                        <Badge
                          variant={move.actor === "user" ? "accent" : "default"}
                        >
                          {move.actor}
                        </Badge>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-md border border-dashed border-border p-4 text-sm text-fg-muted">
                    Make the first move as White.
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}

function ReviewCta({ persistence }: { persistence: PersistenceState }) {
  if (persistence.kind === "saved" || persistence.kind === "ready") {
    return (
      <Button asChild type="button" className="w-full">
        <Link href={`/review/${persistence.gameId}`} data-testid="review-cta">
          {persistence.kind === "saved"
            ? "Review my mistakes"
            : "Review my mistakes (saving…)"}
        </Link>
      </Button>
    );
  }

  if (persistence.kind === "saving" || persistence.kind === "starting") {
    return (
      <Button type="button" className="w-full" disabled>
        <Loader2 className="size-4 animate-spin" /> Saving game…
      </Button>
    );
  }

  if (persistence.kind === "disabled") {
    return (
      <Button type="button" className="w-full" disabled>
        Review unavailable
      </Button>
    );
  }

  return (
    <Button type="button" className="w-full" disabled>
      Preparing review…
    </Button>
  );
}

function StatusBadge({
  status,
  engineState,
}: {
  status: GameStatus;
  engineState: "idle" | "thinking" | "fallback";
}) {
  if (engineState === "thinking") {
    return (
      <Badge variant="warning">
        <Activity className="mr-1 size-3" />
        Thinking
      </Badge>
    );
  }

  if (engineState === "fallback") {
    return (
      <Badge variant="warning">
        <Brain className="mr-1 size-3" />
        Fallback
      </Badge>
    );
  }

  return (
    <Badge variant={status === "active" ? "success" : "accent"}>{status}</Badge>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-bg/40 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg">{value}</p>
    </div>
  );
}
