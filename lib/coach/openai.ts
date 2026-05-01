import type {
  BlunderCategory,
  ReviewSeverity,
} from "@/lib/supabase/database.types";
import OpenAI from "openai";
import { z } from "zod";
import {
  COACH_RESPONSE_SCHEMA,
  buildSystemPrompt,
  buildUserPrompt,
} from "./prompts";
import type { CoachInput, CoachOutput } from "./types";

const CATEGORIES = [
  "Hanging Piece",
  "Missed Tactic",
  "King Safety",
  "Tunnel Vision",
  "Greedy Move",
  "Time Panic",
  "Opening Drift",
  "Endgame Technique",
] as const satisfies readonly BlunderCategory[];

const SEVERITIES = [
  "inaccuracy",
  "mistake",
  "blunder",
] as const satisfies readonly ReviewSeverity[];

const responseSchema = z.object({
  category: z.enum(CATEGORIES),
  severity: z.enum(SEVERITIES),
  explanation: z.string().min(20).max(400),
  trainingHint: z.string().min(10).max(280),
});

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
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

export async function callOpenAiCoach(
  input: CoachInput,
  signal: AbortSignal,
): Promise<CoachOutput> {
  const client = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await client.chat.completions.create(
    {
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: buildSystemPrompt(input.locale) },
        { role: "user", content: buildUserPrompt(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: COACH_RESPONSE_SCHEMA,
      },
    },
    { signal },
  );

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty completion");
  }

  const parsed = responseSchema.parse(JSON.parse(content));

  return {
    category: parsed.category,
    severity: parsed.severity,
    explanation: parsed.explanation,
    trainingHint: parsed.trainingHint,
    source: "openai",
  };
}
