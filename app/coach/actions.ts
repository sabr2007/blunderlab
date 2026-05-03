"use server";

import {
  buildCoachSystemPrompt,
  loadCoachUserContext,
} from "@/lib/coach/coach-context";
import {
  type CoachUsage,
  getDailyLimit,
  getUsage,
  tryConsume,
} from "@/lib/coach/coach-rate-limit";
import type { CoachLocale } from "@/lib/coach/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { z } from "zod";

const COACH_MODEL = process.env.OPENAI_COACH_MODEL || "gpt-4o-mini";
const MAX_USER_MESSAGE_LENGTH = 600;
const MAX_HISTORY_MESSAGES = 10;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_USER_MESSAGE_LENGTH),
});

const inputSchema = z.object({
  locale: z.enum(["en", "ru"]),
  messages: z.array(messageSchema).min(1).max(MAX_HISTORY_MESSAGES),
});

export type CoachChatInput = z.infer<typeof inputSchema>;

export type CoachChatResult =
  | {
      ok: true;
      reply: string;
      usage: CoachUsage;
    }
  | {
      ok: false;
      reason:
        | "unauthenticated"
        | "guest_blocked"
        | "limit_reached"
        | "service"
        | "validation";
      message: string;
      usage?: CoachUsage;
    };

let cachedClient: OpenAI | null = null;

function getOpenAi(): OpenAI {
  if (cachedClient) {
    return cachedClient;
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function isProUser(user: {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}): boolean {
  const fromApp = user.app_metadata?.is_pro;
  if (typeof fromApp === "boolean") {
    return fromApp;
  }
  const fromUser = user.user_metadata?.is_pro;
  if (typeof fromUser === "boolean") {
    return fromUser;
  }
  return false;
}

export async function getCoachUsageAction(): Promise<{
  authenticated: boolean;
  isPro: boolean;
  usage: CoachUsage;
}> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user || user.is_anonymous) {
    return {
      authenticated: false,
      isPro: false,
      usage: {
        used: 0,
        limit: getDailyLimit(false),
        remaining: getDailyLimit(false),
        isPro: false,
      },
    };
  }

  const isPro = isProUser(user);
  return {
    authenticated: true,
    isPro,
    usage: getUsage(user.id, isPro),
  };
}

export async function coachChatAction(
  rawInput: CoachChatInput,
): Promise<CoachChatResult> {
  const parsed = inputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "validation",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  const input = parsed.data;

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return {
      ok: false,
      reason: "unauthenticated",
      message: "Sign in to chat with the coach.",
    };
  }

  if (user.is_anonymous) {
    return {
      ok: false,
      reason: "guest_blocked",
      message: "Sign in with email to unlock the AI Coach.",
    };
  }

  const isPro = isProUser(user);
  const consumed = tryConsume(user.id, isPro);

  if (!consumed) {
    return {
      ok: false,
      reason: "limit_reached",
      message: isPro
        ? "Daily Pro coach limit reached. Come back tomorrow."
        : "Free tier allows 3 coach messages per day. Upgrade to Pro for 20.",
      usage: getUsage(user.id, isPro),
    };
  }

  try {
    const ctx = await loadCoachUserContext(user.id);
    const systemPrompt = buildCoachSystemPrompt(ctx, input.locale);
    const client = getOpenAi();

    const completion = await client.chat.completions.create({
      model: COACH_MODEL,
      temperature: 0.6,
      max_tokens: 480,
      messages: [
        { role: "system" as const, content: systemPrompt },
        ...input.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ??
      (input.locale === "ru"
        ? "Сейчас не получилось ответить. Попробуй ещё раз чуть позже."
        : "I could not generate a response right now. Try again shortly.");

    return {
      ok: true,
      reply,
      usage: consumed,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "OpenAI failed";
    return {
      ok: false,
      reason: "service",
      message:
        input.locale === "ru"
          ? `Сервис тренера недоступен: ${message}`
          : `Coach service unavailable: ${message}`,
      usage: consumed,
    };
  }
}

export type CoachLocaleInput = CoachLocale;
