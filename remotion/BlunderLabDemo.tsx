import { AbsoluteFill, Sequence } from "remotion";
import { DemoCursor } from "./components/DemoCursor";
import { type DemoLocale, SCENES, demoCopy } from "./data/demoGame";
import { DashboardScene } from "./scenes/DashboardScene";
import { FinalScene } from "./scenes/FinalScene";
import { HookScene } from "./scenes/HookScene";
import { LandingScene } from "./scenes/LandingScene";
import { LeaderboardScene } from "./scenes/LeaderboardScene";
import { OnboardingScene } from "./scenes/OnboardingScene";
import { PlayScene } from "./scenes/PlayScene";
import { ReviewScene } from "./scenes/ReviewScene";
import { TrainingGoalScene } from "./scenes/TrainingGoalScene";

export type BlunderLabDemoProps = {
  locale: DemoLocale;
};

export function BlunderLabDemo({ locale }: BlunderLabDemoProps) {
  const copy = demoCopy[locale];

  return (
    <AbsoluteFill className="dark overflow-hidden bg-bg font-sans text-fg">
      <Sequence
        from={SCENES.hook.from}
        durationInFrames={SCENES.hook.duration}
        premountFor={30}
      >
        <HookScene copy={copy} />
      </Sequence>
      <Sequence
        from={SCENES.landing.from}
        durationInFrames={SCENES.landing.duration}
        premountFor={30}
      >
        <LandingScene copy={copy} />
      </Sequence>
      <Sequence
        from={SCENES.onboarding.from}
        durationInFrames={SCENES.onboarding.duration}
        premountFor={30}
      >
        <OnboardingScene copy={copy} />
      </Sequence>
      <Sequence
        from={SCENES.play.from}
        durationInFrames={SCENES.play.duration}
        premountFor={30}
      >
        <PlayScene copy={copy} />
      </Sequence>
      <Sequence
        from={SCENES.review.from}
        durationInFrames={SCENES.review.duration}
        premountFor={30}
      >
        <ReviewScene copy={copy} />
      </Sequence>
      <Sequence
        from={SCENES.trainingGoal.from}
        durationInFrames={SCENES.trainingGoal.duration}
        premountFor={30}
      >
        <TrainingGoalScene copy={copy} />
      </Sequence>
      <Sequence
        from={SCENES.dashboard.from}
        durationInFrames={SCENES.dashboard.duration}
        premountFor={30}
      >
        <DashboardScene copy={copy} />
      </Sequence>
      <Sequence
        from={SCENES.leaderboard.from}
        durationInFrames={SCENES.leaderboard.duration}
        premountFor={30}
      >
        <LeaderboardScene copy={copy} />
      </Sequence>
      <Sequence
        from={SCENES.final.from}
        durationInFrames={SCENES.final.duration}
        premountFor={30}
      >
        <FinalScene copy={copy} />
      </Sequence>
      <DemoCursor />
    </AbsoluteFill>
  );
}
