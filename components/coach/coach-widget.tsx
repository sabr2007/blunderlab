"use client";

import {
  type CoachChatResult,
  coachChatAction,
  getCoachUsageAction,
} from "@/app/coach/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CoachUsage } from "@/lib/coach/coach-rate-limit";
import { Loader2, Lock, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type WidgetStatus = {
  authenticated: boolean;
  isPro: boolean;
  usage: CoachUsage;
};

const SUGGESTED_PROMPT_KEYS = ["promptWeakness", "promptDrill", "promptHabit"];

export function CoachWidget() {
  const t = useTranslations("coach");
  const locale = useLocale();
  const coachLocale = locale === "ru" ? "ru" : "en";

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<WidgetStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadUsage() {
      try {
        const result = await getCoachUsageAction();
        if (!cancelled) {
          setStatus(result);
        }
      } catch {
        if (!cancelled) {
          setStatus({
            authenticated: false,
            isPro: false,
            usage: { used: 0, limit: 3, remaining: 3, isPro: false },
          });
        }
      }
    }
    void loadUsage();
    return () => {
      cancelled = true;
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages.length]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) {
        return;
      }
      if (!status?.authenticated) {
        setErrorMessage(t("signInRequired"));
        return;
      }
      if (status.usage.remaining <= 0) {
        setErrorMessage(t("limitReached"));
        return;
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const nextHistory = [...messages, userMessage];
      setMessages(nextHistory);
      setInput("");
      setSending(true);
      setErrorMessage(null);

      try {
        const result: CoachChatResult = await coachChatAction({
          locale: coachLocale,
          messages: nextHistory.map((message) => ({
            role: message.role === "user" ? "user" : "assistant",
            content: message.content,
          })),
        });

        if (result.ok) {
          setMessages((current) => [
            ...current,
            {
              id: `coach-${Date.now()}`,
              role: "assistant",
              content: result.reply,
            },
          ]);
          setStatus((previous) =>
            previous ? { ...previous, usage: result.usage } : previous,
          );
        } else {
          setErrorMessage(result.message);
          if (result.usage) {
            setStatus((previous) =>
              previous
                ? { ...previous, usage: result.usage as CoachUsage }
                : previous,
            );
          }
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : t("genericError");
        setErrorMessage(message);
      } finally {
        setSending(false);
      }
    },
    [coachLocale, messages, sending, status, t],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  if (!status) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          aria-label={t("widgetLabel")}
          className="pointer-events-auto flex h-[min(580px,80vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-accent/40 bg-bg-elevated/95 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <header className="flex items-start justify-between gap-3 border-b border-border/70 bg-accent/10 px-4 py-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
                <Sparkles className="size-3.5" />
                {t("eyebrow")}
              </p>
              <h2 className="mt-1 truncate text-sm font-semibold tracking-tight">
                {t("title")}
              </h2>
              <p className="mt-0.5 line-clamp-2 text-xs text-fg-muted">
                {t("subtitle")}
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
            >
              <X className="size-4" />
            </Button>
          </header>

          <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-bg/60 px-4 py-2 text-xs">
            <Badge variant={status.isPro ? "accent" : "default"}>
              {status.isPro ? t("planPro") : t("planFree")}
            </Badge>
            <span className="font-mono text-fg-muted">
              {t("usage", {
                used: status.usage.used,
                limit: status.usage.limit,
              })}
            </span>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {!status.authenticated ? (
              <GuestMessage t={t} />
            ) : messages.length === 0 ? (
              <EmptyState
                t={t}
                onPick={(prompt) => {
                  setInput(prompt);
                }}
              />
            ) : (
              messages.map((message) => (
                <Bubble key={message.id} bubbleRole={message.role}>
                  {message.content}
                </Bubble>
              ))
            )}
            {sending ? (
              <Bubble bubbleRole="assistant" pending>
                <Loader2 className="size-4 animate-spin" />
                <span className="sr-only">{t("thinking")}</span>
              </Bubble>
            ) : null}
            {errorMessage ? (
              <p className="rounded-md border border-warning/40 bg-warning/10 p-2 text-xs text-warning">
                {errorMessage}
              </p>
            ) : null}
          </div>

          {status.authenticated ? (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-border/70 bg-bg/60 px-3 py-3"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("inputPlaceholder")}
                disabled={sending || status.usage.remaining <= 0}
                maxLength={600}
                aria-label={t("inputLabel")}
                className="flex-1 rounded-md border border-border bg-bg/60 px-3 py-2 text-sm outline-none transition focus:border-accent disabled:opacity-60"
                data-testid="coach-input"
              />
              <Button
                type="submit"
                size="icon"
                disabled={
                  !input.trim() || sending || status.usage.remaining <= 0
                }
                aria-label={t("send")}
                data-testid="coach-send"
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-2 border-t border-border/70 bg-bg/60 px-4 py-3 text-xs text-fg-muted">
              <Lock className="size-3.5" />
              <span className="flex-1">{t("signInPrompt")}</span>
            </div>
          )}
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto group flex items-center gap-2 rounded-full border border-accent/50 bg-accent/15 px-4 py-3 text-sm font-medium text-accent shadow-lg shadow-black/30 backdrop-blur transition hover:bg-accent/25 hover:text-fg"
          aria-label={t("openLabel")}
          data-testid="coach-launcher"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-bg">
            <Sparkles className="size-4" />
          </span>
          <span className="hidden whitespace-nowrap sm:inline">
            {t("launcher")}
          </span>
          <span className="inline sm:hidden">
            <MessageCircle className="size-4" />
          </span>
        </button>
      )}
    </div>
  );
}

function Bubble({
  bubbleRole,
  children,
  pending = false,
}: {
  bubbleRole: ChatMessage["role"];
  children: React.ReactNode;
  pending?: boolean;
}) {
  const isUser = bubbleRole === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      data-role={bubbleRole}
    >
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-accent text-bg"
            : pending
              ? "border border-border bg-bg/60 text-fg-muted"
              : "border border-border bg-bg/60 text-fg"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function EmptyState({
  t,
  onPick,
}: {
  t: ReturnType<typeof useTranslations<"coach">>;
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-fg-muted">{t("emptyIntro")}</p>
      <ul className="space-y-2">
        {SUGGESTED_PROMPT_KEYS.map((key) => {
          const prompt = t(key);
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onPick(prompt)}
                className="w-full rounded-md border border-border bg-bg/40 px-3 py-2 text-left text-xs leading-relaxed text-fg-muted transition hover:border-accent/50 hover:text-fg"
              >
                {prompt}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GuestMessage({
  t,
}: {
  t: ReturnType<typeof useTranslations<"coach">>;
}) {
  return (
    <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
      {t("guestMessage")}
    </div>
  );
}
