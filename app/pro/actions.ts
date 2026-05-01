"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

export type WaitlistState =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const waitlistSchema = z.object({
  email: z.string().trim().email(),
  source: z.enum(["pro", "school"]).default("pro"),
  company: z.string().max(0).optional(),
});

export async function joinProWaitlistAction(
  _prevState: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "pro",
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    return { kind: "error", message: "Enter a valid email address." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("waitlist_signups").insert({
    email: parsed.data.email.toLowerCase(),
    source: parsed.data.source,
  });

  if (error?.code === "23505") {
    return { kind: "success", message: "You're already on the list." };
  }

  if (error) {
    return { kind: "error", message: error.message };
  }

  return {
    kind: "success",
    message: "You're on the Pro waitlist.",
  };
}
