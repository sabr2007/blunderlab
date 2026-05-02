"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * Stylized 8×8 board that cycles through a "blunder → coach insight" loop.
 * Pure SVG so it scales crisply and stays cheap to animate.
 */

type PieceSymbol =
  | "♔"
  | "♕"
  | "♖"
  | "♗"
  | "♘"
  | "♙"
  | "♚"
  | "♛"
  | "♜"
  | "♝"
  | "♞"
  | "♟";

type Piece = { square: string; glyph: PieceSymbol; light: boolean };

// A clean tactical-feel position. Coordinates use file (a-h) + rank (1-8).
const POSITION: Piece[] = [
  { square: "e1", glyph: "♔", light: true },
  { square: "d1", glyph: "♕", light: true },
  { square: "f1", glyph: "♗", light: true },
  { square: "c3", glyph: "♘", light: true },
  { square: "e4", glyph: "♙", light: true },
  { square: "d4", glyph: "♙", light: true },
  { square: "f3", glyph: "♘", light: true },
  { square: "h2", glyph: "♙", light: true },

  { square: "e8", glyph: "♚", light: false },
  { square: "d8", glyph: "♛", light: false },
  { square: "f8", glyph: "♝", light: false },
  { square: "c6", glyph: "♞", light: false },
  { square: "e5", glyph: "♟", light: false },
  { square: "d6", glyph: "♟", light: false },
  { square: "f6", glyph: "♞", light: false },
];

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

// 0-indexed coordinates from algebraic notation.
function squareToXY(square: string): { x: number; y: number } {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = 8 - Number.parseInt(square[1] ?? "1", 10);
  return { x: file, y: rank };
}

const STAGES = [
  { delay: 600, blunder: null, best: null, arrow: false },
  { delay: 1100, blunder: "h5", best: null, arrow: false },
  { delay: 1100, blunder: "h5", best: null, arrow: true },
  { delay: 1100, blunder: "h5", best: "f7", arrow: true },
  { delay: 2200, blunder: "h5", best: "f7", arrow: true },
] as const;

type Stage = {
  blunder: string | null;
  best: string | null;
  arrow: boolean;
};

export function AnimatedBoard({ className }: { className?: string }) {
  const [stage, setStage] = useState<Stage>(STAGES[0]);
  const [movedQueen, setMovedQueen] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setMovedQueen(true);
      setStage(STAGES[3]);
      return;
    }

    let idx = 0;
    let timer: number | undefined;
    const tick = () => {
      const next = STAGES[idx];
      setStage(next);
      setMovedQueen(idx >= 1);
      idx = (idx + 1) % STAGES.length;
      timer = window.setTimeout(tick, next.delay);
    };
    timer = window.setTimeout(tick, 700);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const SIZE = 64;
  const BOARD = SIZE * 8;
  const queenSquare = movedQueen ? "h5" : "d8";
  const queenPos = squareToXY(queenSquare);

  return (
    <figure
      className={cn(
        "relative isolate aspect-square w-full max-w-[640px]",
        className,
      )}
      aria-label="Animated chess board demonstrating a blunder analysis"
    >
      <div className="absolute inset-0 -z-10 hero-orb" />

      <div
        className="surface-grain relative h-full w-full overflow-hidden rounded-2xl border border-border-strong/70 bg-[oklch(20%_0.01_60)] p-4 sm:p-6"
        style={{ boxShadow: "var(--shadow-board)" }}
      >
        <svg
          viewBox={`0 0 ${BOARD} ${BOARD}`}
          xmlns="http://www.w3.org/2000/svg"
          role="presentation"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="amber-arrow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="oklch(78% 0.16 72 / 0.85)" />
              <stop offset="100%" stopColor="oklch(64% 0.18 50 / 0.95)" />
            </linearGradient>
            <radialGradient id="blunder-glow">
              <stop offset="0%" stopColor="oklch(64% 0.22 25 / 0.85)" />
              <stop offset="100%" stopColor="oklch(64% 0.22 25 / 0)" />
            </radialGradient>
            <radialGradient id="best-glow">
              <stop offset="0%" stopColor="oklch(74% 0.15 145 / 0.8)" />
              <stop offset="100%" stopColor="oklch(74% 0.15 145 / 0)" />
            </radialGradient>
            <filter id="piece-shadow">
              <feDropShadow
                dx="0"
                dy="1.6"
                stdDeviation="1.4"
                floodColor="rgb(0 0 0)"
                floodOpacity="0.55"
              />
            </filter>
          </defs>

          {RANKS.map((rank, ry) =>
            FILES.map((file, fx) => {
              const isLight = (fx + ry) % 2 === 0;
              return (
                <rect
                  key={`sq-${file}${rank}`}
                  x={fx * SIZE}
                  y={ry * SIZE}
                  width={SIZE}
                  height={SIZE}
                  fill={
                    isLight
                      ? "var(--color-board-light)"
                      : "var(--color-board-dark)"
                  }
                />
              );
            }),
          )}

          {/* file/rank markers */}
          {FILES.map((file, fx) => (
            <text
              key={`file-${file}`}
              x={fx * SIZE + 6}
              y={BOARD - 6}
              fontSize={11}
              fontFamily="Geist Mono, monospace"
              fill={
                fx % 2 === 0
                  ? "oklch(36% 0.05 50 / 0.8)"
                  : "oklch(72% 0.04 70 / 0.7)"
              }
            >
              {file}
            </text>
          ))}
          {RANKS.map((rank, ry) => (
            <text
              key={`rank-${rank}`}
              x={BOARD - 14}
              y={ry * SIZE + 16}
              fontSize={11}
              fontFamily="Geist Mono, monospace"
              fill={
                ry % 2 === 0
                  ? "oklch(36% 0.05 50 / 0.8)"
                  : "oklch(72% 0.04 70 / 0.7)"
              }
            >
              {rank}
            </text>
          ))}

          {/* highlights */}
          {stage.blunder ? (
            <Highlight square={stage.blunder} kind="blunder" />
          ) : null}
          {stage.best ? <Highlight square={stage.best} kind="best" /> : null}

          {/* arrow */}
          {stage.arrow ? <Arrow from="h5" to="f7" /> : null}

          {/* pieces */}
          {POSITION.filter((p) => !(p.glyph === "♛" && p.light === false)).map(
            (p) => {
              const { x, y } = squareToXY(p.square);
              return (
                <PieceGlyph
                  key={`p-${p.square}`}
                  glyph={p.glyph}
                  light={p.light}
                  x={x * SIZE + SIZE / 2}
                  y={y * SIZE + SIZE / 2 + 4}
                />
              );
            },
          )}

          {/* the moving queen */}
          <g
            className="piece-glide"
            style={{
              transform: `translate(${queenPos.x * SIZE}px, ${queenPos.y * SIZE}px)`,
            }}
          >
            <PieceGlyph glyph="♛" light={false} x={SIZE / 2} y={SIZE / 2 + 4} />
          </g>
        </svg>

        {/* coach insight overlay */}
        <div className="pointer-events-none absolute -bottom-4 left-1/2 w-[calc(100%-3rem)] max-w-md -translate-x-1/2 sm:bottom-3">
          <div className="surface-card surface-grain shadow-[0_30px_60px_oklch(0%_0_0/0.5)] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                <span className="size-1.5 rounded-full bg-accent pulse-dot" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-fg-subtle">
                  Coach insight
                </p>
                <p className="mt-1 text-sm leading-snug text-fg">
                  17. Qh5? — strong-looking attack, but{" "}
                  <span className="text-accent">Nxf7</span> wins material.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

function Highlight({
  square,
  kind,
}: {
  square: string;
  kind: "blunder" | "best";
}) {
  const { x, y } = squareToXY(square);
  const SIZE = 64;
  const cx = x * SIZE + SIZE / 2;
  const cy = y * SIZE + SIZE / 2;

  return (
    <g>
      <rect
        x={x * SIZE}
        y={y * SIZE}
        width={SIZE}
        height={SIZE}
        fill={
          kind === "blunder"
            ? "oklch(64% 0.22 25 / 0.32)"
            : "oklch(74% 0.15 145 / 0.32)"
        }
      />
      <circle
        cx={cx}
        cy={cy}
        r={SIZE * 0.55}
        fill={`url(#${kind === "blunder" ? "blunder-glow" : "best-glow"})`}
        opacity={0.85}
      >
        <animate
          attributeName="r"
          values={`${SIZE * 0.45};${SIZE * 0.6};${SIZE * 0.45}`}
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

function Arrow({ from, to }: { from: string; to: string }) {
  const SIZE = 64;
  const a = squareToXY(from);
  const b = squareToXY(to);
  const x1 = a.x * SIZE + SIZE / 2;
  const y1 = a.y * SIZE + SIZE / 2;
  const x2 = b.x * SIZE + SIZE / 2;
  const y2 = b.y * SIZE + SIZE / 2;

  return (
    <g>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="oklch(78% 0.16 72)" />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="url(#amber-arrow)"
        strokeWidth={6}
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
        opacity={0.9}
      />
    </g>
  );
}

function PieceGlyph({
  glyph,
  light,
  x,
  y,
}: {
  glyph: PieceSymbol;
  light: boolean;
  x: number;
  y: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={48}
      fontFamily="'Apple Symbols', 'Segoe UI Symbol', system-ui"
      fill={light ? "oklch(98% 0 0)" : "oklch(15% 0 0)"}
      stroke={light ? "oklch(15% 0 0)" : "oklch(98% 0 0)"}
      strokeWidth={0.6}
      filter="url(#piece-shadow)"
      style={{ paintOrder: "stroke fill" }}
    >
      {glyph}
    </text>
  );
}
