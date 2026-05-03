import { ChessBoardWrapper } from "@/components/chess/chess-board-wrapper";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Square } from "chess.js";
import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeSoft = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);

export function clampProgress(
  frame: number,
  start: number,
  duration: number,
  easing = easeOut,
) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function useAppear(start = 0, duration = 18, distance = 24) {
  const frame = useCurrentFrame();
  const progress = clampProgress(frame, start, duration);

  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * distance}px) scale(${
      0.985 + progress * 0.015
    })`,
  };
}

export function SceneShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AbsoluteFill className={cn("overflow-hidden bg-bg text-fg", className)}>
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-20" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(15% 0.006 70 / 0.82), oklch(9% 0.006 70)), linear-gradient(120deg, transparent 0%, oklch(78% 0.16 72 / 0.06) 45%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 180px oklch(0% 0 0 / 0.58), inset 0 -120px 180px oklch(0% 0 0 / 0.46)",
        }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </AbsoluteFill>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Img
        src={staticFile("brand/blunderlab-icon.svg")}
        className="size-10 shrink-0"
      />
      <div>
        <p className="text-xl font-semibold leading-none tracking-normal">
          BlunderLab
        </p>
      </div>
    </div>
  );
}

export function AppWindow({
  route,
  children,
  className,
  style,
  nav,
}: {
  route: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  nav?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border-strong bg-bg/95 shadow-2xl shadow-black/60",
        className,
      )}
      style={style}
    >
      <div className="flex h-14 items-center justify-between border-b border-border bg-surface/85 px-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-danger/80" />
            <span className="size-2.5 rounded-full bg-warning/80" />
            <span className="size-2.5 rounded-full bg-success/80" />
          </div>
          <span className="font-mono text-xs text-fg-subtle">
            blunderlab.app/{route}
          </span>
        </div>
        <div className="flex items-center gap-2">{nav}</div>
      </div>
      {children}
    </div>
  );
}

export function BoardFrame({
  fen,
  lastMove,
  bestMove,
  blunderSquare,
  className,
  children,
}: {
  fen: string;
  lastMove?: { from: Square; to: Square } | null;
  bestMove?: { from: Square; to: Square } | null;
  blunderSquare?: Square | null;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <ChessBoardWrapper
        fen={fen}
        disabled
        orientation="white"
        lastMove={lastMove}
        bestMove={bestMove}
        blunderSquare={blunderSquare}
        className="h-full max-w-none rounded-md border-border-strong/70 shadow-board"
      />
      {children}
    </div>
  );
}

export function MoveArrow({
  from,
  to,
  progress,
  color = "var(--color-success)",
  width = 5,
  yOffset = 0,
}: {
  from: Square;
  to: Square;
  progress: number;
  color?: string;
  width?: number;
  yOffset?: number;
}) {
  const start = squareCenter(from);
  const end = squareCenter(to);
  const markerId = `arrow-${from}-${to}-${Math.round(width)}`;
  const dashLength = 180;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
    >
      <title>Best move arrow</title>
      <defs>
        <marker
          id={markerId}
          markerHeight="7"
          markerUnits="userSpaceOnUse"
          markerWidth="7"
          orient="auto"
          refX="6"
          refY="3.5"
          viewBox="0 0 7 7"
        >
          <path d="M0,0 L7,3.5 L0,7 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1={start.x}
        x2={end.x}
        y1={start.y + yOffset}
        y2={end.y + yOffset}
        stroke={color}
        strokeDasharray={dashLength}
        strokeDashoffset={dashLength * (1 - progress)}
        strokeLinecap="round"
        strokeWidth={width}
        markerEnd={progress > 0.92 ? `url(#${markerId})` : undefined}
        opacity={progress}
      />
    </svg>
  );
}

export function SquareMarker({
  square,
  tone = "danger",
  start = 0,
}: {
  square: Square;
  tone?: "danger" | "warning" | "success";
  start?: number;
}) {
  const frame = useCurrentFrame();
  const appear = clampProgress(frame, start, 16);
  const pulse = frame < start ? 0 : (frame - start) % 34;
  const pulseSize = interpolate(pulse, [0, 34], [0.9, 1.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulseOpacity = interpolate(pulse, [0, 34], [0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const color =
    tone === "success"
      ? "var(--color-success)"
      : tone === "warning"
        ? "var(--color-warning)"
        : "var(--color-danger)";
  const center = squareCenter(square);

  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        height: "12.5%",
        left: `${center.x - 6.25}%`,
        opacity: appear,
        top: `${center.y - 6.25}%`,
        width: "12.5%",
      }}
    >
      <div
        className="absolute inset-[18%] rounded-full border"
        style={{
          borderColor: color,
          boxShadow: `0 0 28px ${color}`,
          transform: `scale(${pulseSize})`,
          opacity: pulseOpacity,
        }}
      />
      <div
        className="absolute inset-[34%] rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

export function SquareCover({ square }: { square: Square }) {
  const center = squareCenter(square);
  const isDark = isDarkSquare(square);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-10"
      style={{
        background: isDark ? "var(--board-dark)" : "var(--board-light)",
        height: "12.5%",
        left: `${center.x - 6.25}%`,
        top: `${center.y - 6.25}%`,
        width: "12.5%",
      }}
    />
  );
}

export function FloatingCard({
  children,
  delay = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = useAppear(delay, 18, 18);
  const lift = spring({
    fps,
    frame: Math.max(0, frame - delay),
    config: {
      damping: 18,
      mass: 0.7,
      stiffness: 130,
    },
  });

  return (
    <div
      className={className}
      style={{
        ...entrance,
        ...style,
        transform: `${entrance.transform} translateY(${(1 - lift) * 5}px)`,
      }}
    >
      {children}
    </div>
  );
}

export function RouteBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="accent" className="px-2.5 py-1 font-mono uppercase">
      {children}
    </Badge>
  );
}

export function StatTile({
  label,
  value,
  tone = "default",
  className,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  className?: string;
  valueClassName?: string;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : tone === "accent"
            ? "text-accent"
            : "text-fg";

  return (
    <div
      className={cn(
        "min-w-0 rounded-md border border-border bg-bg/45 p-4",
        className,
      )}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-fg-subtle">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 min-w-0 font-mono text-2xl tabular-nums",
          toneClass,
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function Counter({
  value,
  suffix = "",
  start = 0,
  duration = 34,
}: {
  value: number;
  suffix?: string;
  start?: number;
  duration?: number;
}) {
  const frame = useCurrentFrame();
  const progress = clampProgress(frame, start, duration, easeSoft);
  const current = Math.round(value * progress);

  return (
    <>
      {current}
      {suffix}
    </>
  );
}

export function MiniTrendLine({ progress = 1 }: { progress?: number }) {
  const points = [
    [20, 28],
    [62, 44],
    [104, 40],
    [146, 66],
    [188, 78],
    [230, 92],
  ];
  const path = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
  const dash = 330;

  return (
    <svg className="h-28 w-full" viewBox="0 0 250 120">
      <title>Blunders trend</title>
      <path
        d="M20 100 H230"
        stroke="var(--color-border)"
        strokeDasharray="4 8"
      />
      <path
        d={path}
        fill="none"
        stroke="var(--color-success)"
        strokeDasharray={dash}
        strokeDashoffset={dash * (1 - progress)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      {points.map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          fill="var(--color-success)"
          opacity={progress}
          r="4"
        />
      ))}
    </svg>
  );
}

function squareCenter(square: Square) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = Number(square[1]);

  return {
    x: ((file + 0.5) / 8) * 100,
    y: ((8 - rank + 0.5) / 8) * 100,
  };
}

function isDarkSquare(square: Square) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = Number(square[1]);

  return (file + rank) % 2 === 1;
}
