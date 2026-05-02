"use client";

import { type WaitlistState, joinProWaitlistAction } from "@/app/pro/actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useActionState } from "react";

const INITIAL_STATE: WaitlistState = { kind: "idle" };

export function WaitlistForm({
  source = "pro",
}: { source?: "pro" | "school" }) {
  const [state, action, pending] = useActionState(
    joinProWaitlistAction,
    INITIAL_STATE,
  );

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="source" value={source} />
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          className="h-11 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
        />
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : state.kind === "success" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <Mail className="size-4" />
          )}
          Join waitlist
        </Button>
      </div>
      {state.kind !== "idle" ? (
        <p
          className={`text-sm ${
            state.kind === "success" ? "text-success" : "text-danger"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
