import type { ActiveTrainingGoal } from "@/lib/training/progress";

export type DailyStatus = "available" | "completed" | "locked";

export type PrimaryActionKind = "daily" | "goal" | "classic";

export type ActionTarget = {
  kind: PrimaryActionKind;
  href: string;
};

export type StatusHint = "daily_completed" | "daily_locked" | null;

export type TodayAction = {
  primary: ActionTarget;
  secondary: ActionTarget | null;
  statusHint: StatusHint;
};

type Input = {
  dailyStatus: DailyStatus;
  activeGoal: Pick<ActiveTrainingGoal, "id"> | null;
};

const DAILY: ActionTarget = { kind: "daily", href: "/daily-blunder" };
const CLASSIC: ActionTarget = { kind: "classic", href: "/play" };

function goalAction(goalId: string): ActionTarget {
  return { kind: "goal", href: `/play?goal=${goalId}` };
}

export function pickPrimaryAction({
  dailyStatus,
  activeGoal,
}: Input): TodayAction {
  if (dailyStatus === "available") {
    return {
      primary: DAILY,
      secondary: activeGoal ? goalAction(activeGoal.id) : CLASSIC,
      statusHint: null,
    };
  }

  const statusHint: StatusHint =
    dailyStatus === "completed" ? "daily_completed" : "daily_locked";

  if (activeGoal) {
    return {
      primary: goalAction(activeGoal.id),
      secondary: CLASSIC,
      statusHint,
    };
  }

  return { primary: CLASSIC, secondary: null, statusHint };
}
