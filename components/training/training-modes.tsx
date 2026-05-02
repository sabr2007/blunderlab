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
import { useTranslations } from "next-intl";
import type React from "react";

type TrainingModesProps = {
  activeGoalId?: string | null;
  activeGoalText?: string | null;
  compact?: boolean;
};

type TrainingMode = {
  title: string;
  eyebrow: string;
  description: string;
  href: string | null;
  icon: React.ComponentType<{ className?: string }>;
  state: "available" | "locked" | "preview";
};

export function TrainingModes({
  activeGoalId,
  activeGoalText,
  compact = false,
}: TrainingModesProps) {
  const t = useTranslations("trainingModes");
  const baseModes = [
    {
      title: t("classicTitle"),
      eyebrow: t("available"),
      description: t("classicDescription"),
      href: "/play",
      icon: Gauge,
      state: "available",
    },
    {
      title: t("dailyTitle"),
      eyebrow: t("available"),
      description: t("dailyDescription"),
      href: "/daily-blunder",
      icon: CalendarCheck,
      state: "available",
    },
    {
      title: t("patternTitle"),
      eyebrow: t("proPreview"),
      description: t("patternDescription"),
      href: "/pro",
      icon: Sparkles,
      state: "locked",
    },
    {
      title: t("deepTitle"),
      eyebrow: t("proPreview"),
      description: t("deepDescription"),
      href: "/pro",
      icon: BrainCircuit,
      state: "locked",
    },
    {
      title: t("builderTitle"),
      eyebrow: t("audienceMode"),
      description: t("builderDescription"),
      href: "/builders",
      icon: Crown,
      state: "preview",
    },
  ] satisfies TrainingMode[];
  const goalMode = {
    title: t("goalTitle"),
    eyebrow: activeGoalText ? t("active") : t("locked"),
    description: activeGoalText ? activeGoalText : t("goalLockedDescription"),
    href: activeGoalId ? `/play?goal=${activeGoalId}` : null,
    icon: Goal,
    state: activeGoalText ? "available" : "locked",
  } satisfies TrainingMode;
  const modes = [baseModes[0], goalMode, ...baseModes.slice(1)];

  return (
    <section className={compact ? "grid gap-3" : "grid gap-4"}>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          {t("eyebrow")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal">
          {t("title")}
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

          const card = (
            <Card
              className={cn(
                "h-full transition group-hover:border-accent/50 group-hover:bg-surface-elevated/60",
                isLocked
                  ? "border-border/80 bg-surface/65 opacity-85"
                  : undefined,
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
          );

          if (!mode.href) {
            return (
              <div
                key={mode.title}
                aria-disabled="true"
                className="cursor-not-allowed"
              >
                {card}
              </div>
            );
          }

          return (
            <Link key={mode.title} href={mode.href} className="group">
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
