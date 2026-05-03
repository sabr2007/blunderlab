import {
  PatternTrendChart,
  type PatternTrendPoint,
} from "@/components/dashboard/pattern-trend-chart";
import { BlunderPatternBadge } from "@/components/review/blunder-pattern-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getDisplayName } from "@/lib/auth/session";
import {
  type DailyStatus,
  type TodayAction,
  pickPrimaryAction,
} from "@/lib/dashboard/today-action";
import type {
  BlunderCategory,
  City,
  GameReviewRow,
  Json,
} from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  type ActiveTrainingGoal,
  type WeeklyWeakness,
  loadActiveTrainingGoal,
  loadIdentityLabel,
  loadWeeklyWeakness,
} from "@/lib/training/progress";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarCheck,
  Flame,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your BlunderLab progress and recent review patterns.",
};

type RecentReview = Pick<
  GameReviewRow,
  | "id"
  | "game_id"
  | "created_at"
  | "main_category"
  | "blunder_count"
  | "mistake_count"
  | "training_goal"
>;

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  display_name: string | null;
  score: number;
  reviewed_games: number;
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await supabase
    .from("profiles")
    .select("display_name,city,default_difficulty")
    .eq("id", user.id)
    .maybeSingle();
  const city = profile.data?.city ?? "Other";
  const displayName = profile.data?.display_name ?? getDisplayName(user);
  const [
    reviewedCount,
    recentReviews,
    trend,
    streak,
    dailyStatus,
    cityRank,
    weeklyWeakness,
    identity,
    activeGoal,
  ] = await Promise.all([
    loadReviewedCount(user.id),
    loadRecentReviews(user.id),
    loadTrend(user.id),
    loadStreak(user.id),
    loadDailyStatus(user.id),
    loadCityRank(user.id, city),
    loadWeeklyWeakness(user.id),
    loadIdentityLabel(user.id),
    loadActiveTrainingGoal(),
  ]);

  const todayAction = pickPrimaryAction({ dailyStatus, activeGoal });

  return (
    <main className="container-wide py-8 lg:py-12">
      <DashboardHeader
        displayName={displayName}
        streak={streak}
        reviewedCount={reviewedCount}
        cityRank={cityRank}
        city={city}
      />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-12 lg:gap-8">
        <TodayCard
          action={todayAction}
          goal={activeGoal}
          dailyStatus={dailyStatus}
          className="lg:col-span-8"
        />
        <WeeklyWeaknessCard
          weeklyWeakness={weeklyWeakness}
          className="lg:col-span-4"
        />

        <PatternTrendCard trend={trend} className="lg:col-span-8" />
        <RecentReviewsCard reviews={recentReviews} className="lg:col-span-4" />

        <IdentityCard
          label={identity.label}
          description={identity.description}
          className="lg:col-span-6"
        />
        <LeaderboardCard
          city={city}
          cityRank={cityRank}
          className="lg:col-span-6"
        />
      </div>
    </main>
  );
}

function DashboardHeader({
  displayName,
  streak,
  reviewedCount,
  cityRank,
  city,
}: {
  displayName: string;
  streak: number;
  reviewedCount: number;
  cityRank: LeaderboardEntry | null;
  city: City;
}) {
  const t = useTranslations("dashboard");

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          {t("headerGreeting", { name: firstName(displayName) })}
        </h1>
        <p className="mt-3 text-base text-fg-muted md:text-lg">
          {t("headerText")}
        </p>
      </div>
      <dl className="flex flex-wrap items-center gap-x-7 gap-y-3 lg:justify-end">
        <KpiStat
          icon={<Flame className="size-4 text-warning" />}
          label={t("streak")}
          value={`${streak}d`}
        />
        <KpiStat
          icon={<CalendarCheck className="size-4 text-accent" />}
          label={t("reviews30d")}
          value={String(reviewedCount)}
        />
        {cityRank ? (
          <KpiStat
            icon={<Trophy className="size-4 text-success" />}
            label={t("inCity", { city })}
            value={`#${cityRank.rank}`}
          />
        ) : null}
      </dl>
    </header>
  );
}

function KpiStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2.5">
      {icon}
      <div className="flex items-baseline gap-1.5">
        <dd className="font-mono text-lg tabular-nums">{value}</dd>
        <dt className="text-xs text-fg-subtle">{label}</dt>
      </div>
    </div>
  );
}

function TodayCard({
  action,
  goal,
  dailyStatus,
  className,
}: {
  action: TodayAction;
  goal: ActiveTrainingGoal | null;
  dailyStatus: DailyStatus;
  className?: string;
}) {
  const t = useTranslations("dashboard");
  const headline = primaryHeadline(action, goal, t);
  const secondaryLabel = action.secondary
    ? t(`secondary.${action.secondary.kind}`)
    : null;
  const statusBlurb = statusHintCopy(action.statusHint, dailyStatus, t);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-accent/35 bg-accent/5",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative">
        <CardHeader className="p-7 pb-4 md:p-8 md:pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {headline.eyebrow}
          </p>
          <CardTitle className="mt-3 text-2xl leading-tight md:text-3xl">
            {headline.title}
          </CardTitle>
          <CardDescription className="mt-2 max-w-xl text-sm leading-relaxed md:text-base">
            {headline.body}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-7 pt-0 md:p-8 md:pt-0">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={action.primary.href}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-bg transition hover:opacity-90"
            >
              {headline.cta}
              <ArrowRight className="size-4" />
            </Link>
            {action.secondary && secondaryLabel ? (
              <Link
                href={action.secondary.href}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-bg/40 px-5 text-sm font-medium text-fg-muted transition hover:border-border-strong hover:text-fg"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
          {statusBlurb ? (
            <p className="mt-4 text-xs text-fg-subtle">{statusBlurb}</p>
          ) : null}
        </CardContent>
      </div>
    </Card>
  );
}

function primaryHeadline(
  action: TodayAction,
  goal: ActiveTrainingGoal | null,
  t: ReturnType<typeof useTranslations<"dashboard">>,
): { eyebrow: string; title: string; body: string; cta: string } {
  switch (action.primary.kind) {
    case "daily":
      return {
        eyebrow: t("dailyBlunder"),
        title: t("todayDailyTitle"),
        body: t("todayDailyBody"),
        cta: t("openDaily"),
      };
    case "goal":
      return {
        eyebrow: t("activeGoal"),
        title: goal?.text ?? t("todayGoalTitle"),
        body: t("todayGoalBody"),
        cta: t("playWithGoal"),
      };
    case "classic":
      return {
        eyebrow: t("nextMove"),
        title: t("todayClassicTitle"),
        body: t("todayClassicBody"),
        cta: t("startClassic"),
      };
  }
}

function statusHintCopy(
  hint: TodayAction["statusHint"],
  _dailyStatus: DailyStatus,
  t: ReturnType<typeof useTranslations<"dashboard">>,
): string | null {
  if (hint === "daily_completed") {
    return t("dailyCompletedHint");
  }
  if (hint === "daily_locked") {
    return t("dailyLocked");
  }
  return null;
}

function WeeklyWeaknessCard({
  weeklyWeakness,
  className,
}: {
  weeklyWeakness: WeeklyWeakness;
  className?: string;
}) {
  const t = useTranslations("dashboard");
  const improved = weeklyWeakness.direction === "down";
  const worsened = weeklyWeakness.direction === "up";
  const variant = improved ? "success" : worsened ? "danger" : "warning";

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="p-6 pb-3 md:p-7 md:pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {t("weeklyWeakness")}
        </p>
        {weeklyWeakness.category ? (
          <CardTitle className="mt-3 text-xl md:text-2xl">
            <BlunderPatternBadge category={weeklyWeakness.category} />
          </CardTitle>
        ) : (
          <CardTitle className="mt-3 text-xl text-fg-muted md:text-2xl">
            {t("needData")}
          </CardTitle>
        )}
        <CardDescription className="mt-2">
          {t("weeklyWeaknessDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5 p-6 pt-0 md:p-7 md:pt-0">
        {weeklyWeakness.direction === "insufficient" ? (
          <p className="text-sm text-fg-muted">
            {t("needMoreGames", {
              current: weeklyWeakness.currentGames,
              previous: weeklyWeakness.previousGames,
            })}
          </p>
        ) : (
          <div className="flex items-end gap-5">
            <div>
              <span className="block font-mono text-3xl tabular-nums">
                {formatPerGame(weeklyWeakness.currentPerGame)}
              </span>
              <span className="mt-1 block text-xs text-fg-subtle">
                {t("thisWeekPerGame")}
              </span>
            </div>
            <span aria-hidden className="pb-2 text-fg-subtle">
              ←
            </span>
            <div>
              <span className="block font-mono text-2xl tabular-nums text-fg-muted">
                {formatPerGame(weeklyWeakness.previousPerGame)}
              </span>
              <span className="mt-1 block text-xs text-fg-subtle">
                {t("lastWeek")}
              </span>
            </div>
          </div>
        )}
        {weeklyWeakness.direction !== "insufficient" ? (
          <Badge variant={variant} className="w-fit py-1.5">
            {improved ? (
              <TrendingDown className="mr-1 size-3" />
            ) : worsened ? (
              <TrendingUp className="mr-1 size-3" />
            ) : null}
            {improved
              ? t("improving")
              : worsened
                ? t("needsFocus")
                : t("stable")}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PatternTrendCard({
  trend,
  className,
}: {
  trend: PatternTrendPoint[];
  className?: string;
}) {
  const t = useTranslations("dashboard");
  const hasData = trend.some(
    (point) => point.blunders + point.mistakes + point.inaccuracies > 0,
  );

  return (
    <Card className={className}>
      <CardHeader className="p-6 pb-3 md:p-7 md:pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {t("patternTrend")}
        </p>
        <CardTitle className="mt-3 text-xl md:text-2xl">
          {t("trendTitle")}
        </CardTitle>
        <CardDescription className="mt-2">
          {t("trendDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 md:p-7 md:pt-0">
        {hasData ? (
          <PatternTrendChart data={trend} />
        ) : (
          <EmptyState text={t("trendEmpty")} />
        )}
      </CardContent>
    </Card>
  );
}

function RecentReviewsCard({
  reviews,
  className,
}: {
  reviews: RecentReview[];
  className?: string;
}) {
  const t = useTranslations("dashboard");
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="p-6 pb-3 md:p-7 md:pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {t("recentReviews")}
        </p>
        <CardTitle className="mt-3 text-xl md:text-2xl">
          {t("recentReviewsTitle")}
        </CardTitle>
        <CardDescription className="mt-2">
          {t("recentReviewsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6 pt-0 md:p-7 md:pt-0">
        {reviews.length > 0 ? (
          <ul className="-mx-1 divide-y divide-border/70">
            {reviews.map((review) => (
              <li key={review.id} className="px-1">
                <Link
                  href={`/review/${review.game_id}`}
                  className="group flex flex-col gap-2 rounded-md py-3 transition hover:bg-bg/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-fg-subtle">
                      {formatDate(review.created_at)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-fg-muted transition group-hover:text-accent">
                      {t("open")}
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed">
                    {review.training_goal ?? t("openReview")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {review.main_category ? (
                      <BlunderPatternBadge category={review.main_category} />
                    ) : (
                      <Badge variant="success">{t("clean")}</Badge>
                    )}
                    {review.blunder_count > 0 ? (
                      <Badge variant="danger">
                        {t("blundersShort", { count: review.blunder_count })}
                      </Badge>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState text={t("noReviews")} />
        )}
      </CardContent>
    </Card>
  );
}

function IdentityCard({
  label,
  description,
  className,
}: {
  label: string;
  description: string;
  className?: string;
}) {
  const t = useTranslations("dashboard");
  return (
    <Card className={className}>
      <CardHeader className="p-6 pb-3 md:p-7 md:pb-4">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-accent">
          <Sparkles className="size-3.5" />
          {t("chessIdentity")}
        </p>
        <CardTitle className="mt-3 text-xl text-accent md:text-2xl">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 md:p-7 md:pt-0">
        <p className="text-sm leading-relaxed text-fg-muted">{description}</p>
      </CardContent>
    </Card>
  );
}

function LeaderboardCard({
  city,
  cityRank,
  className,
}: {
  city: City;
  cityRank: LeaderboardEntry | null;
  className?: string;
}) {
  const t = useTranslations("dashboard");
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="p-6 pb-3 md:p-7 md:pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {t("leaderboardCity", { city })}
        </p>
        <CardTitle className="mt-3 text-xl md:text-2xl">
          {cityRank ? t("ranked", { rank: cityRank.rank }) : t("notRanked")}
        </CardTitle>
        <CardDescription className="mt-2">
          {t("leaderboardDescription", { city })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5 p-6 pt-0 md:p-7 md:pt-0">
        {cityRank ? (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dd className="font-mono text-2xl tabular-nums">
                {cityRank.score.toFixed(2)}
              </dd>
              <dt className="mt-1 text-xs text-fg-subtle">
                {t("improvementScore")}
              </dt>
            </div>
            <div>
              <dd className="font-mono text-2xl tabular-nums">
                {cityRank.reviewed_games}
              </dd>
              <dt className="mt-1 text-xs text-fg-subtle">
                {t("reviewedThisWeek")}
              </dt>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-fg-muted">{t("needFiveGames")}</p>
        )}
        <Link
          href="/leaderboard"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-fg-muted transition hover:border-border-strong hover:text-fg"
        >
          {t("viewLeaderboard")}
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-border p-5 text-sm text-fg-muted">
      {text}
    </p>
  );
}

function formatPerGame(value: number | null): string {
  if (value === null) {
    return "n/a";
  }

  return value.toFixed(1);
}

function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] ?? fullName;
}

async function loadReviewedCount(userId: string) {
  const supabase = await getSupabaseServerClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const result = await supabase
    .from("game_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  return result.count ?? 0;
}

async function loadRecentReviews(userId: string): Promise<RecentReview[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("game_reviews")
    .select(
      "id,game_id,created_at,main_category,blunder_count,mistake_count,training_goal",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  return data ?? [];
}

async function loadTrend(userId: string): Promise<PatternTrendPoint[]> {
  const supabase = await getSupabaseServerClient();
  const now = Date.now();
  const start = now - 28 * 24 * 60 * 60 * 1000;
  const { data } = await supabase
    .from("critical_moments")
    .select("severity,created_at")
    .eq("user_id", userId)
    .gte("created_at", new Date(start).toISOString());
  const buckets: PatternTrendPoint[] = Array.from(
    { length: 4 },
    (_, index) => ({
      label: `W${index + 1}`,
      blunders: 0,
      mistakes: 0,
      inaccuracies: 0,
    }),
  );

  for (const moment of data ?? []) {
    const offset = Math.floor(
      (new Date(moment.created_at).getTime() - start) /
        (7 * 24 * 60 * 60 * 1000),
    );
    const bucket = buckets[Math.min(Math.max(offset, 0), 3)];
    if (moment.severity === "blunder") bucket.blunders += 1;
    if (moment.severity === "mistake") bucket.mistakes += 1;
    if (moment.severity === "inaccuracy") bucket.inaccuracies += 1;
  }

  return buckets;
}

async function loadStreak(userId: string): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const [reviews, attempts] = await Promise.all([
    supabase
      .from("game_reviews")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", since),
    supabase
      .from("daily_blunder_attempts")
      .select("completed_at")
      .eq("user_id", userId)
      .eq("success", true)
      .gte("completed_at", since),
  ]);

  const days = new Set<string>();
  for (const row of reviews.data ?? []) {
    days.add(row.created_at.slice(0, 10));
  }
  for (const row of attempts.data ?? []) {
    if (row.completed_at) days.add(row.completed_at.slice(0, 10));
  }

  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

async function loadDailyStatus(userId: string): Promise<DailyStatus> {
  const supabase = await getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const attempt = await supabase
    .from("daily_blunder_attempts")
    .select("success")
    .eq("user_id", userId)
    .eq("attempt_date", today)
    .maybeSingle();

  if (attempt.data?.success) return "completed";

  const moments = await supabase
    .from("critical_moments")
    .select("id")
    .eq("user_id", userId)
    .in("severity", ["mistake", "blunder"])
    .limit(1);

  return moments.data && moments.data.length > 0 ? "available" : "locked";
}

async function loadCityRank(userId: string, city: City) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("leaderboard_snapshots")
    .select("snapshot")
    .eq("city", city)
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  const snapshot = parseLeaderboardSnapshot(data?.snapshot);
  return snapshot.find((entry) => entry.user_id === userId) ?? null;
}

function parseLeaderboardSnapshot(value: Json | undefined): LeaderboardEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isLeaderboardEntry);
}

function isLeaderboardEntry(value: Json): value is LeaderboardEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return (
    typeof value.rank === "number" &&
    typeof value.user_id === "string" &&
    typeof value.score === "number" &&
    typeof value.reviewed_games === "number"
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
