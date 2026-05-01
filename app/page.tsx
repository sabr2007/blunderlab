import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

const PATTERNS = [
  { name: "Hanging Piece", hint: "Left a piece undefended." },
  { name: "Tunnel Vision", hint: "Attacked while leaving the king exposed." },
  { name: "King Safety", hint: "Weakened defense around your king." },
  { name: "Greedy Move", hint: "Grabbed material, lost the position." },
  { name: "Missed Tactic", hint: "A forcing line was on the board." },
  { name: "Time Panic", hint: "Move made too fast under pressure." },
  { name: "Opening Drift", hint: "Early deviation from sound development." },
  { name: "Endgame Technique", hint: "A more precise method existed." },
];

export default function LandingPage() {
  return (
    <main className="relative">
      <div className="lab-grid pointer-events-none absolute inset-0 -z-10 opacity-30" />

      <header className="container flex items-center justify-between py-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
            ◇
          </span>
          BlunderLab
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-fg-muted md:flex">
          <Link href="#how-it-works" className="hover:text-fg">
            How it works
          </Link>
          <Link href="#patterns" className="hover:text-fg">
            Patterns
          </Link>
          <Link href="/pro" className="hover:text-fg">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="hidden text-sm text-fg-muted hover:text-fg sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/play"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-bg transition hover:opacity-90"
          >
            Start training <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="container relative pb-24 pt-12 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Prototype · nFactorial Incubator 2026
          </span>
          <h1 className="text-display mt-6 text-balance">
            Turn every blunder into your next{" "}
            <span className="text-accent">training plan.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-fg-muted">
            BlunderLab reviews your games, explains your mistakes in plain
            language, detects recurring patterns, and gives you one clear goal
            for the next match.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/play"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-90"
            >
              Start training <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/40 px-5 py-2.5 text-sm font-medium text-fg transition hover:bg-surface"
            >
              <PlayCircle className="h-4 w-4" /> Sign in for dashboard
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
          <Stat label="Games reviewed" value="0" hint="Stockfish + AI Coach" />
          <Stat label="Pattern coverage" value="8" hint="Locked taxonomy" />
          <Stat label="Coach latency" value="<8s" hint="p95 target" />
        </div>
      </section>

      <section id="patterns" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Blunder taxonomy
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Eight patterns that explain how you actually lose.
          </h2>
          <p className="mt-4 text-fg-muted">
            Engine analysis tells you what was wrong. BlunderLab tells you which
            thinking habit caused it — and how to break it next game.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PATTERNS.map((p, i) => (
            <article
              key={p.name}
              className="surface-card p-5 transition hover:border-accent/40"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium tracking-tight">{p.name}</h3>
                <span className="font-mono text-xs text-fg-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-2 text-sm text-fg-muted">{p.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-fg-muted md:flex-row">
          <p>
            © {new Date().getFullYear()} BlunderLab — Sabyrzhan · nFactorial
            2026
          </p>
          <p className="font-mono text-xs">v0.1 · prototype</p>
        </div>
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="surface-card flex flex-col gap-1 p-5">
      <span className="text-xs uppercase tracking-widest text-fg-muted">
        {label}
      </span>
      <span className="font-mono text-3xl tracking-tight">{value}</span>
      <span className="text-xs text-fg-muted">{hint}</span>
    </div>
  );
}
