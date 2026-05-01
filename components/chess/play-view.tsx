"use client";

import { ChessBoardWrapper } from "@/components/chess/chess-board-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ENGINE_PRESETS, StockfishEngine } from "@/lib/chess/engine";
import {
  STARTING_FEN,
  createGame,
  getLegalTargetSquares,
  getSnapshotFromFen,
  isSquare,
  tryMove,
  tryUciMove,
} from "@/lib/chess/rules";
import type { AiDifficulty, GameStatus, MoveRecord } from "@/lib/chess/types";
import type { Square } from "chess.js";
import { Activity, Brain, CheckCircle2, RotateCcw, Swords } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const DIFFICULTIES: AiDifficulty[] = ["beginner", "intermediate", "advanced"];

export function PlayView() {
  const [fen, setFen] = useState(STARTING_FEN);
  const [difficulty, setDifficulty] = useState<AiDifficulty>("beginner");
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [engineState, setEngineState] = useState<
    "idle" | "thinking" | "fallback"
  >("idle");
  const [forcedStatus, setForcedStatus] = useState<GameStatus | null>(null);
  const engineRef = useRef<StockfishEngine | null>(null);
  const requestIdRef = useRef(0);

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

  function restart() {
    requestIdRef.current += 1;
    setFen(STARTING_FEN);
    setMoves([]);
    setSelectedSquare(null);
    setLegalTargets([]);
    setForcedStatus(null);
    setEngineState("idle");
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
    setMoves((current) => [...current, result.record]);
    setSelectedSquare(null);
    setLegalTargets([]);

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
        setMoves((current) => [...current, applied.record]);
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
      setMoves((current) => [...current, applied.record]);
    }

    setEngineState("fallback");
    window.setTimeout(() => setEngineState("idle"), 1200);
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-20" />
      <div className="container py-6 md:py-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Phase 1 · Playable MVP
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
                disabled={engineState === "thinking"}
                onClick={() => setDifficulty(level)}
              >
                {ENGINE_PRESETS[level].label}
              </Button>
            ))}
          </div>
        </header>

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
                  Legal moves are handled by chess.js. The AI response comes
                  from the Stockfish worker.
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
                    Phase 2 will attach the review pipeline to this exact state.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button type="button" className="w-full">
                    Review my mistakes
                  </Button>
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
