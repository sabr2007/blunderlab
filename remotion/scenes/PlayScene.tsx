import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Crown,
  Goal,
  Swords,
} from "lucide-react";
import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  AppWindow,
  BoardFrame,
  BrandLockup,
  FloatingCard,
  RouteBadge,
  SceneShell,
  SquareCover,
  SquareMarker,
  StatTile,
  clampProgress,
  easeInOut,
  easeSoft,
} from "../components/SceneShell";
import { type DemoCopy, demoGame } from "../data/demoGame";

export function PlayScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const dragProgress = clampProgress(frame, 42, 76, easeInOut);
  const dragging = frame >= 42 && frame <= 118;
  const userMoveVisible = frame >= 112;
  const aiMoveVisible = frame >= 152;
  const criticalVisible = clampProgress(frame, 188, 16);
  const postGame = clampProgress(frame, 282, 24, easeSoft);
  const ctaGlow = clampProgress(frame, 362, 12) - clampProgress(frame, 382, 14);

  return (
    <SceneShell>
      <AppWindow
        route={copy.play.route}
        className="absolute left-[110px] top-[76px] h-[930px] w-[1700px]"
        nav={
          <>
            <RouteBadge>{copy.common.dashboard}</RouteBadge>
            <RouteBadge>{copy.common.dailyBlunder}</RouteBadge>
            <RouteBadge>{copy.common.pro}</RouteBadge>
          </>
        }
      >
        <div className="grid h-[calc(100%-56px)] grid-cols-[minmax(0,1fr)_430px] gap-6 p-8">
          <section>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <BrandLockup />
                  <Badge variant="success" className="px-2.5 py-1">
                    {copy.common.intermediate}
                  </Badge>
                </div>
                <h1 className="mt-6 text-[44px] font-semibold tracking-normal">
                  {copy.play.title}
                </h1>
                <p className="mt-2 text-lg text-fg-muted">
                  {copy.play.subtitle}
                </p>
              </div>
              <div className="rounded-md border border-success/35 bg-success/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                  <Goal className="size-4" />
                  {copy.play.activeGoal}
                </div>
                <p className="mt-1 text-sm text-fg-muted">
                  {copy.play.activeGoalText}
                </p>
              </div>
            </div>

            <div className="relative w-[660px]">
              <BoardFrame
                fen={userMoveVisible ? demoGame.fenAfter : demoGame.fenBefore}
                blunderSquare={userMoveVisible ? "h5" : null}
                lastMove={userMoveVisible ? { from: "d1", to: "h5" } : null}
              >
                {dragging ? <SquareCover square="d1" /> : null}
                {dragging ? <DraggedQueen progress={dragProgress} /> : null}
                {criticalVisible > 0 ? (
                  <SquareMarker square="h5" start={188} />
                ) : null}
              </BoardFrame>
              <div
                className="absolute left-[410px] top-[282px] rounded-md border border-danger/40 bg-danger/15 px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-danger"
                style={{
                  opacity: criticalVisible,
                  transform: `translateY(${(1 - criticalVisible) * 10}px)`,
                }}
              >
                {copy.play.critical}
              </div>
            </div>
          </section>

          <aside className="relative grid content-start gap-4">
            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  {copy.play.gameStatus}
                  <Badge variant={aiMoveVisible ? "accent" : "warning"}>
                    {aiMoveVisible ? copy.play.active : copy.play.thinking}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 p-5 pt-0">
                <StatTile label={copy.play.aiOpponent} value="Stockfish" />
                <StatTile
                  label={copy.play.difficulty}
                  value={copy.common.intermediate}
                  tone="accent"
                  valueClassName="text-[20px] leading-tight tracking-normal"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-xl">
                  {copy.play.moveHistory}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 p-5 pt-0">
                <MoveRow label="1." move="e4" reply="e5" />
                <MoveRow label="2." move="Bc4" reply="Nf6" />
                <MoveRow label="3." move="Nc3" reply="Be6" />
                <MoveRow
                  label="4."
                  move={userMoveVisible ? copy.play.userMove : "..."}
                  reply={aiMoveVisible ? "Qf6" : "..."}
                  active={userMoveVisible}
                />
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="grid gap-3 p-5">
                <LoopRow icon={Swords} label={copy.common.play} active />
                <LoopRow icon={Brain} label={copy.common.review} />
                <LoopRow icon={Goal} label={copy.goal.title} />
                <LoopRow icon={BarChart3} label={copy.common.dashboard} />
              </CardContent>
            </Card>

            <FloatingCard
              delay={286}
              className="absolute bottom-0 left-0 right-0"
              style={{ opacity: postGame }}
            >
              <Card className="border-accent/45 bg-accent/10 shadow-2xl shadow-black/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CheckCircle2 className="size-6 text-success" />
                    {copy.play.gameComplete}
                  </CardTitle>
                  <p className="text-base text-fg-muted">{copy.play.found}</p>
                </CardHeader>
                <CardContent>
                  <Button
                    className="h-14 w-full text-base"
                    style={{
                      boxShadow: `0 0 ${32 * ctaGlow}px oklch(78% 0.16 72 / ${
                        0.44 * ctaGlow
                      })`,
                    }}
                  >
                    {copy.play.reviewCta}
                  </Button>
                </CardContent>
              </Card>
            </FloatingCard>
          </aside>
        </div>
      </AppWindow>
    </SceneShell>
  );
}

function DraggedQueen({ progress }: { progress: number }) {
  const x = interpolate(progress, [0, 1], [43.75, 93.75]);
  const y = interpolate(progress, [0, 1], [93.75, 43.75]);

  return (
    <span
      className="pointer-events-none absolute z-30 grid size-[12.5%] place-items-center text-[54px] leading-none text-white"
      style={{
        left: `${x}%`,
        textShadow: "0 8px 16px oklch(0% 0 0 / 0.6)",
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      ♕
    </span>
  );
}

function MoveRow({
  label,
  move,
  reply,
  active = false,
}: {
  label: string;
  move: string;
  reply: string;
  active?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-[42px_1fr_1fr] items-center gap-2 rounded-md border px-3 py-2"
      style={{
        background: active
          ? "oklch(64% 0.22 25 / 0.10)"
          : "oklch(11% 0.006 70 / 0.52)",
        borderColor: active
          ? "oklch(64% 0.22 25 / 0.42)"
          : "var(--color-border)",
      }}
    >
      <span className="font-mono text-xs text-fg-subtle">{label}</span>
      <span className={active ? "font-mono text-danger" : ""}>{move}</span>
      <span className="text-fg-muted">{reply}</span>
    </div>
  );
}

function LoopRow({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-bg/40 px-3 py-2">
      <span
        className={
          active
            ? "grid size-8 place-items-center rounded-md bg-accent/15 text-accent"
            : "grid size-8 place-items-center rounded-md bg-surface text-fg-muted"
        }
      >
        <Icon className="size-4" />
      </span>
      <span className={active ? "text-fg" : "text-fg-muted"}>{label}</span>
    </div>
  );
}
