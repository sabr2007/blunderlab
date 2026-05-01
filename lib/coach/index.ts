import { getFallbackCoachOutput } from "./fallback";
import { callOpenAiCoach } from "./openai";
import type { CoachInput, CoachOutput } from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;

export type CoachOptions = {
  timeoutMs?: number;
  forceFallback?: boolean;
};

export async function runCoach(
  input: CoachInput,
  options: CoachOptions = {},
): Promise<CoachOutput> {
  if (options.forceFallback || !process.env.OPENAI_API_KEY) {
    return getFallbackCoachOutput(input);
  }

  const timeout = options.timeoutMs ?? readTimeoutFromEnv();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const result = await callOpenAiCoach(input, controller.signal);
    return result;
  } catch (error) {
    console.warn("[coach] falling back to template", {
      message: error instanceof Error ? error.message : String(error),
    });
    return getFallbackCoachOutput(input);
  } finally {
    clearTimeout(timer);
  }
}

function readTimeoutFromEnv(): number {
  const raw = process.env.COACH_TIMEOUT_MS;
  if (!raw) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export type { CoachInput, CoachOutput } from "./types";
