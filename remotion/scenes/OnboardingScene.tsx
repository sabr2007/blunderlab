import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, Sparkles, UserRound } from "lucide-react";
import { useCurrentFrame } from "remotion";
import {
  AppWindow,
  BrandLockup,
  RouteBadge,
  SceneShell,
  clampProgress,
  useAppear,
} from "../components/SceneShell";
import type { DemoCopy } from "../data/demoGame";

export function OnboardingScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const title = useAppear(6, 16, 20);
  const levelSelected = frame >= 50;
  const cityVisible = clampProgress(frame, 58, 18);
  const citySelected = frame >= 104;
  const startVisible = clampProgress(frame, 112, 16);

  return (
    <SceneShell>
      <AppWindow
        route={copy.onboarding.route}
        className="absolute left-[190px] top-[105px] h-[870px] w-[1540px]"
        nav={
          <>
            <RouteBadge>{copy.common.astana}</RouteBadge>
            <RouteBadge>{copy.common.intermediate}</RouteBadge>
          </>
        }
      >
        <div className="h-[calc(100%-56px)] p-14">
          <div className="flex items-start justify-between">
            <BrandLockup />
            <Badge variant="accent" className="px-3 py-1">
              <Sparkles className="mr-1 size-3" />
              {copy.onboarding.badge}
            </Badge>
          </div>

          <div className="mt-14 grid grid-cols-[0.86fr_1.14fr] gap-12">
            <section style={title}>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {copy.onboarding.eyebrow}
              </p>
              <h1 className="mt-4 max-w-[560px] text-[58px] font-semibold leading-[1.02] tracking-normal">
                {copy.onboarding.title}
              </h1>
              <p className="mt-5 max-w-[530px] text-xl leading-relaxed text-fg-muted">
                {copy.onboarding.levelText}
              </p>
            </section>

            <section className="relative min-h-[620px]">
              <Card
                className="absolute left-0 top-0 w-full border-accent/30 bg-surface/95"
                style={{
                  opacity: 1 - clampProgress(frame, 62, 18) * 0.28,
                  transform: `translateX(${-18 * cityVisible}px) scale(${
                    1 - cityVisible * 0.035
                  })`,
                }}
              >
                <CardHeader className="p-7">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <UserRound className="size-6 text-accent" />
                    {copy.onboarding.levelTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3 p-7 pt-0">
                  {copy.onboarding.levels.map((level) => {
                    const selected = level === copy.common.intermediate;
                    return (
                      <Choice
                        key={level}
                        label={level}
                        selected={selected && levelSelected}
                      />
                    );
                  })}
                </CardContent>
              </Card>

              <Card
                className="absolute left-[56px] top-[220px] w-[calc(100%-56px)] border-accent/30 bg-surface/95"
                style={{
                  opacity: cityVisible,
                  transform: `translateX(${(1 - cityVisible) * 90}px)`,
                }}
              >
                <CardHeader className="p-7">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <MapPin className="size-6 text-accent" />
                    {copy.onboarding.cityTitle}
                  </CardTitle>
                  <p className="text-sm text-fg-muted">
                    {copy.onboarding.cityText}
                  </p>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-3 p-7 pt-0">
                  {copy.onboarding.cities.map((city) => {
                    const selected = city === copy.common.astana;
                    return (
                      <Choice
                        key={city}
                        label={city}
                        selected={selected && citySelected}
                      />
                    );
                  })}
                </CardContent>
              </Card>

              <Button
                className="absolute bottom-[28px] right-0 h-14 px-8 text-lg"
                style={{
                  opacity: startVisible,
                  transform: `translateY(${(1 - startVisible) * 20}px)`,
                }}
              >
                {copy.onboarding.start}
                <ArrowRight className="size-5" />
              </Button>
            </section>
          </div>
        </div>
      </AppWindow>
    </SceneShell>
  );
}

function Choice({ label, selected }: { label: string; selected: boolean }) {
  return (
    <div
      className="rounded-md border bg-bg/45 p-5 text-center text-lg font-medium"
      style={{
        borderColor: selected ? "#5b8cff" : "var(--color-border)",
        boxShadow: selected ? "0 0 0 1px #5b8cff, 0 0 32px #5b8cff44" : "none",
        color: selected ? "oklch(92% 0.04 255)" : "var(--color-text)",
      }}
    >
      {label}
    </div>
  );
}
