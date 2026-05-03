// In-memory rate limiter for the AI Coach chat. Each Vercel Function instance
// keeps its own counter; that is good enough for the launch, where a single
// user typically lands on the same warm instance. If we ever need strict
// limits across instances we can persist to Supabase.

const usageMap = new Map<string, { date: string; count: number }>();

const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 20;

export type CoachUsage = {
  used: number;
  limit: number;
  remaining: number;
  isPro: boolean;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyLimit(isPro: boolean): number {
  return isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
}

export function getUsage(userId: string, isPro: boolean): CoachUsage {
  const today = todayKey();
  const existing = usageMap.get(userId);
  const used = existing && existing.date === today ? existing.count : 0;
  const limit = getDailyLimit(isPro);
  return { used, limit, remaining: Math.max(0, limit - used), isPro };
}

export function tryConsume(userId: string, isPro: boolean): CoachUsage | null {
  const today = todayKey();
  const limit = getDailyLimit(isPro);
  const existing = usageMap.get(userId);
  const used = existing && existing.date === today ? existing.count : 0;

  if (used >= limit) {
    return null;
  }

  const nextCount = used + 1;
  usageMap.set(userId, { date: today, count: nextCount });
  return {
    used: nextCount,
    limit,
    remaining: limit - nextCount,
    isPro,
  };
}
