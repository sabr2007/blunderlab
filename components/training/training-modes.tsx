import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  CalendarCheck,
  Crown,
  Gauge,
  Goal,
  Lock,
  Sparkles,
} from "lucide-react";

type TrainingModesProps = {
  activeGoalId?: string | null;
  activeGoalText?: string | null;
  compact?: boolean;
};

const baseModes = [
  {
    title: "Classic Game",
    eyebrow: "Available",
    description: "Play a clean Stockfish game and review it after the result.",
    href: "/play",
    icon: Gauge,
    state: "available",
  },
  {
    title: "Daily Blunder",
    eyebrow: "Available",
    description: "Solve one position from your own past mistakes.",
    href: "/daily-blunder",
    icon: CalendarCheck,
    state: "available",
  },
  {
    title: "Pattern Drill",
    eyebrow: "Pro preview",
    description: "Practice short drills generated from repeated mistake types.",
    href: "/pro",
    icon: Sparkles,
    state: "locked",
  },
  {
    title: "Deep Review",
    eyebrow: "Pro preview",
    description: "Unlock deeper coach explanations and longer mistake history.",
    href: "/pro",
    icon: BrainCircuit,
    state: "locked",
  },
  {
    title: "Builder Sprint",
    eyebrow: "Audience mode",
    description: "Train pattern recognition and decisions under pressure.",
    href: "/builders",
    icon: Crown,
    state: "preview",
  },
] as const;

export function TrainingModes({
  activeGoalId,
  activeGoalText,
  compact = false,
}: TrainingModesProps) {
  const goalMode = {
    title: "Goal Focus",
    eyebrow: activeGoalText ? "Active" : "Locked",
    description: activeGoalText
      ? activeGoalText
      : "Finish a review to carry one concrete goal into the next game.",
    href: activeGoalId ? `/play?goal=${activeGoalId}` : "/play",
    icon: Goal,
    state: activeGoalText ? "available" : "locked",
  } as const;
  const modes = [baseModes[0], goalMode, ...baseModes.slice(1)];

  return (
    <section className={compact ? "grid gap-3" : "grid gap-4"}>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Training modes
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal">
          Pick the kind of thinking you want to train.
        </h2>
      </div>
      <div
        className={cn(
          "grid gap-3",
          compact ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isLocked = mode.state === "locked";

          return (
            <Link key={mode.title} href={mode.href} className="group">
              <Card
                className={cn(
                  "h-full transition group-hover:border-accent/50 group-hover:bg-surface-elevated/60",
                  isLocked ? "border-border/80 bg-surface/65" : undefined,
                  mode.state === "preview"
                    ? "border-accent/30 bg-accent/5"
                    : undefined,
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-9 place-items-center rounded-md bg-accent/10 text-accent">
                      <Icon className="size-4" />
                    </span>
                    <Badge
                      variant={
                        mode.state === "available"
                          ? "success"
                          : mode.state === "preview"
                            ? "accent"
                            : "warning"
                      }
                    >
                      {isLocked ? <Lock className="mr-1 size-3" /> : null}
                      {mode.eyebrow}
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-semibold tracking-normal">
                    {mode.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-muted">
                    {mode.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
