import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, MapPin, Trophy, UsersRound } from "lucide-react";
import { useCurrentFrame } from "remotion";
import {
  AppWindow,
  BrandLockup,
  Counter,
  RouteBadge,
  SceneShell,
  StatTile,
  clampProgress,
  easeSoft,
} from "../components/SceneShell";
import { type DemoCopy, dashboardStats } from "../data/demoGame";

export function LeaderboardScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const panelIn = clampProgress(frame, 0, 22, easeSoft);
  const rowIn = (index: number) => clampProgress(frame, 22 + index * 10, 18);

  return (
    <SceneShell>
      <AppWindow
        route="leaderboard"
        className="absolute left-[140px] top-[88px] h-[900px] w-[1640px]"
        nav={
          <>
            <RouteBadge>{copy.common.dashboard}</RouteBadge>
            <RouteBadge>{copy.common.dailyBlunder}</RouteBadge>
          </>
        }
        style={{
          opacity: panelIn,
          transform: `translateY(${(1 - panelIn) * 34}px) scale(${
            0.97 + panelIn * 0.03
          })`,
        }}
      >
        <div className="h-[calc(100%-56px)] p-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <BrandLockup />
              <div className="mt-7 flex items-center gap-3">
                <Badge variant="accent" className="px-3 py-1 text-sm">
                  <MapPin className="mr-1 size-4" />
                  {copy.common.astana}
                </Badge>
                <Badge variant="success" className="px-3 py-1 text-sm">
                  {copy.dashboard.cityRankValue}
                </Badge>
              </div>
              <h1 className="mt-4 text-[46px] font-semibold tracking-normal">
                {copy.dashboard.leaderboardTitle}
              </h1>
              <p className="mt-2 max-w-[660px] text-xl text-fg-muted">
                {copy.dashboard.leaderboardSubtitle}
              </p>
            </div>

            <div className="grid w-[420px] grid-cols-2 gap-3">
              <StatTile
                label={copy.dashboard.blundersReduced}
                tone="success"
                value={
                  <>
                    -
                    <Counter
                      duration={38}
                      start={10}
                      suffix="%"
                      value={dashboardStats.blundersReduced}
                    />
                  </>
                }
              />
              <StatTile
                label={copy.dashboard.gamesReviewed}
                tone="accent"
                value={<Counter duration={36} start={8} value={5} />}
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_420px] gap-6">
            <Card className="overflow-hidden border-border-strong bg-surface/85">
              <CardHeader className="border-b border-border p-0">
                <div className="grid grid-cols-[1.3fr_0.85fr_1fr_1fr] gap-4 px-6 py-4 font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle">
                  <span>{copy.dashboard.leaderboardPlayer}</span>
                  <span>{copy.dashboard.leaderboardImprovement}</span>
                  <span>{copy.dashboard.leaderboardReviews}</span>
                  <span>{copy.dashboard.leaderboardPattern}</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 p-5">
                {copy.dashboard.leaderboardTable.map((row, index) => {
                  const progress = rowIn(index);
                  const isSabyr = row.player === copy.common.sabyr;

                  return (
                    <div
                      key={`${row.rank}-${row.player}`}
                      className="grid grid-cols-[1.3fr_0.85fr_1fr_1fr] items-center gap-4 rounded-md border px-5 py-4"
                      style={{
                        background: isSabyr
                          ? "oklch(78% 0.16 72 / 0.11)"
                          : "oklch(11% 0.006 70 / 0.55)",
                        borderColor: isSabyr
                          ? "oklch(78% 0.16 72 / 0.42)"
                          : "var(--color-border)",
                        opacity: progress,
                        transform: `translateX(${(1 - progress) * 26}px)`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            isSabyr
                              ? "grid size-10 place-items-center rounded-md bg-warning/15 font-mono text-warning"
                              : "grid size-10 place-items-center rounded-md bg-bg font-mono text-fg-muted"
                          }
                        >
                          {row.rank}
                        </span>
                        <div>
                          <p className="text-xl font-semibold">{row.player}</p>
                          <p className="text-sm text-fg-muted">{row.city}</p>
                        </div>
                      </div>
                      <span className="font-mono text-2xl text-success">
                        {row.improvement}
                      </span>
                      <span className="text-base text-fg">{row.reviews}</span>
                      <Badge
                        variant={isSabyr ? "warning" : "accent"}
                        className="w-fit px-3 py-1 text-sm"
                      >
                        {row.pattern}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <section className="grid content-start gap-5">
              <Card>
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <UsersRound className="size-5 text-accent" />
                    {copy.common.leaderboard}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 p-5 pt-0">
                  {copy.dashboard.leaderboardCities.map((city) => (
                    <span
                      key={city}
                      className={
                        city === copy.common.astana
                          ? "rounded-md border border-accent/45 bg-accent/15 px-4 py-3 text-center text-accent"
                          : "rounded-md border border-border bg-bg/45 px-4 py-3 text-center text-fg-muted"
                      }
                    >
                      {city}
                    </span>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-warning/35 bg-warning/10">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BrainCircuit className="size-5 text-warning" />
                    {copy.review.patternTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 text-xl leading-relaxed">
                  {copy.dashboard.leaderboardRows[0]}
                </CardContent>
              </Card>

              <Card className="border-success/35 bg-success/10">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Trophy className="size-5 text-success" />
                    {copy.dashboard.cityRankValue}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 text-lg text-fg-muted">
                  {copy.dashboard.leaderboardRows[1]}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </AppWindow>
    </SceneShell>
  );
}
