import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Goal,
  Sparkles,
} from "lucide-react";
import { useCurrentFrame } from "remotion";
import {
  AppWindow,
  BoardFrame,
  BrandLockup,
  FloatingCard,
  RouteBadge,
  SceneShell,
  SquareMarker,
  StatTile,
  clampProgress,
} from "../components/SceneShell";
import { type DemoCopy, demoGame } from "../data/demoGame";

export function LandingScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const windowProgress = clampProgress(frame, 0, 24);
  const clickGlow =
    clampProgress(frame, 118, 12) - clampProgress(frame, 136, 14);

  return (
    <SceneShell>
      <AppWindow
        route={copy.landing.route}
        className="absolute left-[120px] top-[95px] h-[890px] w-[1680px]"
        nav={
          <>
            <RouteBadge>{copy.common.play}</RouteBadge>
            <RouteBadge>{copy.common.review}</RouteBadge>
            <RouteBadge>{copy.common.dashboard}</RouteBadge>
          </>
        }
        style={{
          opacity: windowProgress,
          transform: `translateY(${(1 - windowProgress) * 38}px) scale(${
            0.965 + windowProgress * 0.035
          })`,
        }}
      >
        <div className="grid h-[calc(100%-56px)] grid-cols-[0.9fr_1.1fr] gap-12 p-14">
          <section className="flex flex-col justify-between">
            <div>
              <BrandLockup />
              <FloatingCard delay={12}>
                <div className="mt-20 flex flex-wrap gap-2">
                  {[
                    copy.landing.signalOne,
                    copy.landing.signalTwo,
                    copy.landing.signalThree,
                  ].map((signal) => (
                    <Badge key={signal} variant="accent" className="py-1">
                      <Sparkles className="mr-1 size-3" />
                      {signal}
                    </Badge>
                  ))}
                </div>
                <h1 className="mt-7 max-w-[680px] text-[70px] font-semibold leading-[0.98] tracking-normal">
                  {copy.landing.headline}
                </h1>
                <p className="mt-6 max-w-[620px] text-[24px] leading-[1.45] text-fg-muted">
                  {copy.landing.subheadline}
                </p>
              </FloatingCard>
            </div>
            <Button
              className="h-14 w-fit px-7 text-lg"
              style={{
                boxShadow: `0 0 ${28 * clickGlow}px oklch(78% 0.16 72 / ${
                  0.4 * clickGlow
                })`,
              }}
            >
              {copy.common.startTraining}
              <ArrowRight className="size-5" />
            </Button>
          </section>

          <section className="relative min-w-0">
            <FloatingCard
              delay={18}
              className="absolute left-0 top-[92px] w-[500px]"
            >
              <BoardFrame
                fen={demoGame.fenAfter}
                blunderSquare="h5"
                lastMove={{ from: "d1", to: "h5" }}
                bestMove={{ from: "f1", to: "e1" }}
              >
                <SquareMarker square="h5" start={58} />
              </BoardFrame>
            </FloatingCard>

            <FloatingCard
              delay={46}
              className="absolute left-[532px] top-[88px] w-[300px]"
            >
              <Card className="border-accent/35 bg-accent/10 shadow-2xl shadow-black/40">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BrainCircuit className="size-5 text-accent" />
                    {copy.landing.coachTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-base leading-relaxed text-fg">
                    {copy.landing.coachText}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="size-4" />
                    {copy.landing.signalTwo}
                  </div>
                </CardContent>
              </Card>
            </FloatingCard>

            <FloatingCard
              delay={64}
              className="absolute left-[532px] top-[310px] grid w-[300px] gap-3"
            >
              <StatTile label={copy.landing.statOne} value="12" tone="accent" />
              <StatTile
                label={copy.landing.statTwo}
                value={copy.review.patternTitle}
                tone="warning"
                valueClassName="text-xl leading-tight"
              />
            </FloatingCard>

            <FloatingCard
              delay={78}
              className="absolute left-[532px] top-[545px] w-[300px]"
            >
              <Card className="border-success/35 bg-success/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 place-items-center rounded-md bg-success/15 text-success">
                    <Goal className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-success">
                      {copy.goal.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                      {copy.goal.text}
                    </p>
                  </div>
                </div>
              </Card>
            </FloatingCard>
          </section>
        </div>
      </AppWindow>
    </SceneShell>
  );
}
