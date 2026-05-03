"use client";

import { finalizeGameAction, startGameAction } from "@/app/play/actions";
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
  ArrowLeft,
  BarChart3,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Gauge,
  Goal,
  Loader2,
  RotateCcw,
  Sparkles,
  Swords,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DIFFICULTIES: AiDifficulty[] = ["beginner", "intermediate", "advanced"];
type PlayMode = "classic" | "goal";

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
  const t = useTranslations("play");
  const [fen, setFen] = useState(STARTING_FEN);
  const [phase, setPhase] = useState<"setup" | "playing">("setup");
  const [selectedMode, setSelectedMode] = useState<PlayMode>(
    activeGoal ? "goal" : "classic",
  );
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
          reason: "Supabase env not set - review storage is disabled.",
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
    phase === "playing" &&
    snapshot.turn === "w" &&
    gameStatus === "active" &&
    engineState !== "thinking";
  const lastMove = moves.at(-1) ?? null;
  const selectedModeLabel =
    selectedMode === "goal" && activeGoal ? t("goalFocus") : t("classicGame");

  useEffect(() => {
    engineRef.current = new StockfishEngine();

    return () => {
      requestIdRef.current += 1;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase === "setup" && activeGoal && moves.length === 0) {
      setSelectedMode("goal");
    }
  }, [activeGoal, moves.length, phase]);

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

  function resetBoard() {
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

  function startSelectedGame() {
    resetBoard();
    setGoalDismissed(false);
    setPhase("playing");
  }

  function restart() {
    resetBoard();
    setPhase("setup");
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
    <main className="min-h-full bg-bg">
      <div className="container-wide px-4 py-6 md:py-8">
        {phase === "setup" ? (
          <SetupView
            activeGoal={activeGoal}
            difficulty={difficulty}
            selectedMode={selectedMode}
            onDifficultyChange={setDifficulty}
            onModeChange={setSelectedMode}
            onStart={startSelectedGame}
          />
        ) : (
          <>
            <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                    {selectedModeLabel}
                  </p>
                  <Badge>{ENGINE_PRESETS[difficulty].label}</Badge>
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
                  {t("playReviewTitle")}
                </h1>
              </div>
              {moves.length === 0 && engineState !== "thinking" ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPhase("setup")}
                  className="self-start md:self-auto"
                >
                  <ArrowLeft /> {t("changeMode")}
                </Button>
              ) : null}
            </header>

            {selectedMode === "goal" && activeGoal && !goalDismissed ? (
              <section className="mb-5 rounded-md border border-success/35 bg-success/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-success/15 text-success">
                      <Goal className="size-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-success">
                          {t("currentGoal")}
                        </p>
                        {activeGoal.category ? (
                          <Badge variant="success">{activeGoal.category}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg">
                        {activeGoal.text}
                      </p>
                      <p className="mt-2 text-xs text-fg-muted">
                        {t("goalHint")}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-start"
                    aria-label={t("dismissGoal")}
                    onClick={() => setGoalDismissed(true)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </section>
            ) : null}

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
                      <CardTitle>{t("gameStatus")}</CardTitle>
                      <StatusBadge
                        status={gameStatus}
                        engineState={engineState}
                        t={t}
                      />
                    </div>
                    <CardDescription>{t("statusDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Metric
                        label={t("turn")}
                        value={snapshot.turn === "w" ? t("white") : t("black")}
                      />
                      <Metric label={t("moves")} value={String(moves.length)} />
                      <Metric label={t("mode")} value={selectedModeLabel} />
                      <Metric
                        label={t("check")}
                        value={snapshot.isCheck ? t("yes") : t("no")}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={restart}
                      >
                        <RotateCcw /> {t("newSetup")}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        disabled={gameStatus !== "active"}
                        onClick={resign}
                      >
                        <Swords /> {t("resign")}
                      </Button>
                    </div>

                    {persistence.kind === "disabled" ? (
                      <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                        {t("persistenceOffline")}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>

                {gameStatus !== "active" ? (
                  <Card className="border-accent/40 bg-accent/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-success" />
                        {t("gameFinished")}
                      </CardTitle>
                      <CardDescription>
                        {t("reviewDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReviewCta persistence={persistence} t={t} />
                    </CardContent>
                  </Card>
                ) : null}

                <Card>
                  <CardHeader>
                    <CardTitle>{t("moveHistory")}</CardTitle>
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
                              {move.moveNumber}.
                              {move.color === "black" ? ".." : ""}
                            </span>
                            <span>{move.san}</span>
                            <Badge
                              variant={
                                move.actor === "user" ? "accent" : "default"
                              }
                            >
                              {move.actor === "user" ? t("user") : t("ai")}
                            </Badge>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="rounded-md border border-dashed border-border p-4 text-sm text-fg-muted">
                        {t("firstMove")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SetupView({
  activeGoal,
  difficulty,
  selectedMode,
  onDifficultyChange,
  onModeChange,
  onStart,
}: {
  activeGoal?: ActiveTrainingGoal | null;
  difficulty: AiDifficulty;
  selectedMode: PlayMode;
  onDifficultyChange: (difficulty: AiDifficulty) => void;
  onModeChange: (mode: PlayMode) => void;
  onStart: () => void;
}) {
  const t = useTranslations("play");
  const goalAvailable = Boolean(activeGoal);

  return (
    <>
      <header className="mb-6 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          {t("setupEyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          {t("setupTitle")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted md:text-base">
          {t("setupText")}
        </p>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <ModeChoice
              icon={Gauge}
              title={t("classicGame")}
              eyebrow={t("available")}
              description={t("classicDescription")}
              selected={selectedMode === "classic"}
              onClick={() => onModeChange("classic")}
            />
            <ModeChoice
              icon={Goal}
              title={t("goalFocus")}
              eyebrow={goalAvailable ? t("activeGoal") : t("needsReview")}
              description={activeGoal?.text ?? t("goalFocusDescription")}
              selected={selectedMode === "goal"}
              disabled={!goalAvailable}
              onClick={() => onModeChange("goal")}
            />
          </div>

          <Card className="border-accent/25 bg-accent/5">
            <CardHeader>
              <CardTitle>{t("difficulty")}</CardTitle>
              <CardDescription>{t("difficultyDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3">
                {DIFFICULTIES.map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={difficulty === level ? "default" : "secondary"}
                    onClick={() => onDifficultyChange(level)}
                  >
                    {ENGINE_PRESETS[level].label}
                  </Button>
                ))}
              </div>
              <Button type="button" className="mt-4 w-full" onClick={onStart}>
                <Swords /> {t("startGame")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="grid gap-4 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>{t("productLoop")}</CardTitle>
              <CardDescription>{t("productLoopDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <LoopLink
                href="/dashboard"
                icon={BarChart3}
                title={t("dashboard")}
                description={t("dashboardDescription")}
              />
              <LoopLink
                href="/daily-blunder"
                icon={CalendarCheck}
                title={t("dailyBlunder")}
                description={t("dailyDescription")}
              />
              <LoopLink
                href="/pro"
                icon={Sparkles}
                title={t("deepModes")}
                description={t("deepModesDescription")}
              />
            </CardContent>
          </Card>
        </aside>
      </section>
    </>
  );
}

function ModeChoice({
  icon: Icon,
  title,
  eyebrow,
  description,
  selected,
  disabled = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  eyebrow: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "group h-full rounded-md border p-5 text-left transition",
        selected
          ? "border-accent/60 bg-accent/10 shadow-[var(--shadow-glow)]"
          : "border-border bg-card hover:border-accent/40 hover:bg-surface-elevated/60",
        disabled ? "cursor-not-allowed opacity-65" : "",
      ].join(" ")}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-accent/10 text-accent">
          <Icon className="size-5" />
        </span>
        <Badge variant={disabled ? "warning" : selected ? "accent" : "success"}>
          {eyebrow}
        </Badge>
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-normal">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
        {description}
      </p>
    </button>
  );
}

function LoopLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-md border border-border bg-bg/40 p-3 transition hover:border-accent/40 hover:bg-surface"
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-fg-muted">
          {description}
        </span>
      </span>
    </Link>
  );
}

type PlayT = ReturnType<typeof useTranslations<"play">>;

function ReviewCta({
  persistence,
  t,
}: {
  persistence: PersistenceState;
  t: PlayT;
}) {
  if (persistence.kind === "saved" || persistence.kind === "ready") {
    return (
      <Button asChild type="button" className="w-full">
        <Link href={`/review/${persistence.gameId}`} data-testid="review-cta">
          {persistence.kind === "saved"
            ? t("reviewMistakes")
            : t("reviewSaving")}
        </Link>
      </Button>
    );
  }

  if (persistence.kind === "saving" || persistence.kind === "starting") {
    return (
      <Button type="button" className="w-full" disabled>
        <Loader2 className="size-4 animate-spin" /> {t("savingGame")}
      </Button>
    );
  }

  if (persistence.kind === "disabled") {
    return (
      <Button type="button" className="w-full" disabled>
        {t("reviewUnavailable")}
      </Button>
    );
  }

  return (
    <Button type="button" className="w-full" disabled>
      {t("preparingReview")}
    </Button>
  );
}

function StatusBadge({
  status,
  engineState,
  t,
}: {
  status: GameStatus;
  engineState: "idle" | "thinking" | "fallback";
  t: PlayT;
}) {
  if (engineState === "thinking") {
    return (
      <Badge variant="warning">
        <Activity className="mr-1 size-3" />
        {t("thinking")}
      </Badge>
    );
  }

  if (engineState === "fallback") {
    return (
      <Badge variant="warning">
        <Brain className="mr-1 size-3" />
        {t("fallback")}
      </Badge>
    );
  }

  return (
    <Badge variant={status === "active" ? "success" : "accent"}>
      {t(status)}
    </Badge>
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
