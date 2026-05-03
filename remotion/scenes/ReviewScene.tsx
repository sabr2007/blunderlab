import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Crosshair, ShieldAlert } from "lucide-react";
import { useCurrentFrame } from "remotion";
import {
  AppWindow,
  BoardFrame,
  MoveArrow,
  RouteBadge,
  SceneShell,
  SquareMarker,
  StatTile,
  clampProgress,
  easeSoft,
  useAppear,
} from "../components/SceneShell";
import { type DemoCopy, demoGame } from "../data/demoGame";

export function ReviewScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const heading = useAppear(4, 16, 18);
  const arrowProgress = clampProgress(frame, 112, 24, easeSoft);
  const coachProgress = clampProgress(frame, 72, 58);
  const typedLength = Math.floor(copy.review.coachText.length * coachProgress);
  const badgeProgress = clampProgress(frame, 136, 18);

  return (
    <SceneShell>
      <AppWindow
        route={copy.review.route}
        className="absolute left-[100px] top-[72px] h-[936px] w-[1720px]"
        nav={
          <>
            <RouteBadge>{copy.common.review}</RouteBadge>
            <RouteBadge>{copy.review.patternTitle}</RouteBadge>
          </>
        }
      >
        <div className="h-[calc(100%-56px)] p-8">
          <div className="mb-5 flex items-end justify-between">
            <div style={heading}>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {copy.review.eyebrow}
              </p>
              <h1 className="mt-2 text-[42px] font-semibold tracking-normal">
                {copy.review.title}
              </h1>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <StatTile
                label={copy.review.accuracy}
                value="71%"
                tone="accent"
              />
              <StatTile label={copy.review.blunders} value="2" tone="danger" />
              <StatTile label={copy.review.mistakes} value="4" tone="warning" />
              <StatTile
                label={copy.review.mainPattern}
                value={copy.review.patternTitle}
                tone="warning"
              />
            </div>
          </div>

          <div className="grid grid-cols-[780px_1fr] gap-7">
            <Card className="overflow-hidden border-border-strong bg-surface/80">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center gap-2">
                    <Crosshair className="size-5 text-accent" />
                    {copy.review.criticalMoment}
                  </span>
                  <Badge variant="danger">{demoGame.severity}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <BoardFrame
                  fen={demoGame.fenAfter}
                  blunderSquare="h5"
                  lastMove={{ from: "d1", to: "h5" }}
                  bestMove={{ from: "f1", to: "e1" }}
                >
                  <MoveArrow
                    from="f1"
                    progress={arrowProgress}
                    to="e1"
                    width={7}
                    yOffset={-8}
                  />
                  <SquareMarker square="h5" start={42} />
                  <SquareMarker square="g1" start={116} tone="warning" />
                </BoardFrame>
              </CardContent>
            </Card>

            <section className="grid content-start gap-4">
              <Card>
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ShieldAlert className="size-5 text-danger" />
                    {copy.review.move}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 p-5 pt-0">
                  <StatTile
                    label={copy.review.yourMove}
                    value={demoGame.userMove}
                    tone="danger"
                  />
                  <StatTile
                    label={copy.review.bestMove}
                    value={demoGame.bestMove}
                    tone="success"
                  />
                </CardContent>
              </Card>

              <Card className="border-accent/35 bg-accent/10">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BrainCircuit className="size-5 text-accent" />
                    {copy.review.aiCoach}
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[138px] p-5 pt-0 text-[21px] leading-relaxed">
                  {copy.review.coachText.slice(0, typedLength)}
                  {typedLength < copy.review.coachText.length ? (
                    <span className="text-accent">|</span>
                  ) : null}
                </CardContent>
              </Card>

              <Card
                className="border-warning/35 bg-warning/10"
                style={{
                  opacity: badgeProgress,
                  transform: `translateY(${(1 - badgeProgress) * 18}px)`,
                }}
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="warning" className="px-3 py-1 text-sm">
                      {copy.review.patternTitle}
                    </Badge>
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-warning">
                      {copy.review.patternDetected}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 text-xl leading-relaxed text-fg">
                  {copy.review.patternText}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </AppWindow>
    </SceneShell>
  );
}
