import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Goal, Sparkles, Swords } from "lucide-react";
import { useCurrentFrame } from "remotion";
import {
  AppWindow,
  BoardFrame,
  BrandLockup,
  RouteBadge,
  SceneShell,
  clampProgress,
  easeSoft,
} from "../components/SceneShell";
import { type DemoCopy, demoGame } from "../data/demoGame";

export function TrainingGoalScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const focus = clampProgress(frame, 0, 26, easeSoft);
  const clickGlow =
    clampProgress(frame, 88, 12) - clampProgress(frame, 108, 14);
  const sticky = clampProgress(frame, 104, 22, easeSoft);

  return (
    <SceneShell>
      <AppWindow
        route={copy.goal.route}
        className="absolute left-[150px] top-[95px] h-[890px] w-[1620px]"
        nav={
          <>
            <RouteBadge>{copy.common.play}</RouteBadge>
            <RouteBadge>{copy.common.pro}</RouteBadge>
          </>
        }
      >
        <div className="relative grid h-[calc(100%-56px)] grid-cols-[0.82fr_1.18fr] gap-10 p-12">
          <section
            className="pt-7"
            style={{
              opacity: 0.42 + focus * 0.58,
              transform: `translateX(${-20 + focus * 20}px)`,
            }}
          >
            <BrandLockup />
            <div className="mt-12 w-[520px] opacity-75">
              <BoardFrame
                fen={demoGame.fenAfter}
                blunderSquare="h5"
                lastMove={{ from: "d1", to: "h5" }}
              />
            </div>
          </section>

          <section className="flex items-center">
            <Card
              className="w-full border-success/45 bg-success/10 shadow-2xl shadow-black/50"
              style={{
                transform: `scale(${0.96 + focus * 0.04})`,
              }}
            >
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-[42px]">
                    <Goal className="size-10 text-success" />
                    {copy.goal.title}
                  </CardTitle>
                  <Badge variant="warning" className="px-3 py-1 text-sm">
                    {copy.review.patternTitle}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <p className="max-w-[760px] text-[32px] leading-[1.28] tracking-normal">
                  {copy.goal.text}
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <Button
                    className="h-14 px-8 text-lg"
                    style={{
                      boxShadow: `0 0 ${
                        34 * clickGlow
                      }px oklch(74% 0.15 145 / ${0.44 * clickGlow})`,
                    }}
                  >
                    <Swords className="size-5" />
                    {copy.goal.cta}
                    <ArrowRight className="size-5" />
                  </Button>
                  <span className="inline-flex items-center gap-2 rounded-md border border-accent/25 bg-accent/10 px-3 py-2 text-sm text-accent">
                    <Sparkles className="size-4" />
                    {copy.goal.proHint}
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          <div
            className="absolute bottom-8 left-12 right-12 rounded-md border border-success/40 bg-success/15 px-5 py-4 shadow-2xl shadow-black/40"
            style={{
              opacity: sticky,
              transform: `translateY(${(1 - sticky) * 26}px)`,
            }}
          >
            <div className="flex items-center gap-3">
              <Goal className="size-5 text-success" />
              <p className="text-lg font-medium text-success">
                {copy.goal.sticky}
              </p>
            </div>
          </div>
        </div>
      </AppWindow>
    </SceneShell>
  );
}
