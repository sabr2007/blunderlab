import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  CalendarCheck,
  Flame,
  Target,
  TrendingDown,
  Trophy,
} from "lucide-react";
import type React from "react";
import { useCurrentFrame } from "remotion";
import {
  AppWindow,
  BoardFrame,
  BrandLockup,
  Counter,
  MiniTrendLine,
  RouteBadge,
  SceneShell,
  StatTile,
  clampProgress,
  easeSoft,
} from "../components/SceneShell";
import { type DemoCopy, dashboardStats, demoGame } from "../data/demoGame";

export function DashboardScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const trendProgress = clampProgress(frame, 22, 58, easeSoft);

  return (
    <SceneShell>
      <AppWindow
        route={copy.dashboard.route}
        className="absolute left-[110px] top-[70px] h-[930px] w-[1700px]"
        nav={
          <>
            <RouteBadge>{copy.common.dailyBlunder}</RouteBadge>
            <RouteBadge>{copy.common.leaderboard}</RouteBadge>
          </>
        }
      >
        <div className="h-[calc(100%-56px)] p-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <BrandLockup />
              <h1 className="mt-6 text-[42px] font-semibold tracking-normal">
                {copy.dashboard.title}
              </h1>
            </div>
            <Badge variant="success" className="px-3 py-1 text-base">
              <TrendingDown className="mr-1 size-4" />
              -32%
            </Badge>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <StatTile
              className="col-span-3"
              label={copy.dashboard.gamesReviewed}
              tone="accent"
              value={<Counter start={5} value={dashboardStats.gamesReviewed} />}
            />
            <StatTile
              className="col-span-3"
              label={copy.dashboard.streak}
              tone="warning"
              value={
                <Counter start={8} suffix="d" value={dashboardStats.streak} />
              }
            />
            <StatTile
              className="col-span-3"
              label={copy.dashboard.topWeakness}
              tone="warning"
              value={copy.review.patternTitle}
            />
            <StatTile
              className="col-span-3"
              label={copy.dashboard.blundersReduced}
              tone="success"
              value={
                <>
                  -
                  <Counter
                    start={12}
                    suffix="%"
                    value={dashboardStats.blundersReduced}
                  />
                </>
              }
            />

            <Card className="col-span-7 border-success/30 bg-success/5">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BarChart3 className="size-6 text-success" />
                  {copy.dashboard.blundersReduced}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <MiniTrendLine progress={trendProgress} />
              </CardContent>
            </Card>

            <Card className="col-span-5">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CalendarCheck className="size-6 text-accent" />
                  {copy.dashboard.dailyTitle}
                </CardTitle>
                <p className="text-sm text-fg-muted">
                  {copy.dashboard.dailyText}
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-[170px_1fr] gap-4 p-6 pt-0">
                <BoardFrame
                  className="w-[170px]"
                  fen={demoGame.dailyFen}
                  bestMove={{ from: "b5", to: "c7" }}
                />
                <div className="flex flex-col justify-between">
                  <p className="text-xl leading-snug">
                    {copy.dashboard.dailyPrompt}
                  </p>
                  <Badge variant="accent" className="w-fit px-3 py-1">
                    {copy.common.dailyBlunder}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-5">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Trophy className="size-6 text-success" />
                  {copy.dashboard.cityRankValue}
                </CardTitle>
                <p className="text-sm text-fg-muted">
                  {copy.dashboard.leaderboardTitle}
                </p>
              </CardHeader>
              <CardContent className="grid gap-2 p-6 pt-0">
                {copy.dashboard.leaderboardRows.map((row) => (
                  <div
                    key={row}
                    className="rounded-md border border-border bg-bg/45 px-4 py-3 text-base"
                  >
                    {row}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="col-span-7 border-accent/30 bg-accent/5">
              <CardContent className="grid grid-cols-3 gap-4 p-6">
                <Kpi
                  icon={<Target className="size-5 text-accent" />}
                  label={copy.goal.title}
                  value={copy.play.activeGoalText}
                />
                <Kpi
                  icon={<Flame className="size-5 text-warning" />}
                  label={copy.dashboard.streak}
                  value={copy.dashboard.streakValue}
                />
                <Kpi
                  icon={<Trophy className="size-5 text-success" />}
                  label={copy.dashboard.cityRank}
                  value={copy.dashboard.cityRankValue}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppWindow>
    </SceneShell>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-bg/45 p-4">
      <div className="flex items-center gap-2 text-sm text-fg-subtle">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-base leading-relaxed text-fg">{value}</p>
    </div>
  );
}
