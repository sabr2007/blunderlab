import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeSoft } from "./SceneShell";

type CursorPoint = {
  frame: number;
  x: number;
  y: number;
};

const cursorPath: CursorPoint[] = [
  { frame: 0, x: 1260, y: 690 },
  { frame: 85, x: 720, y: 560 },
  { frame: 130, x: 1180, y: 520 },
  { frame: 210, x: 515, y: 700 },
  { frame: 246, x: 475, y: 690 },
  { frame: 282, x: 780, y: 430 },
  { frame: 318, x: 742, y: 432 },
  { frame: 360, x: 730, y: 622 },
  { frame: 374, x: 720, y: 622 },
  { frame: 402, x: 965, y: 790 },
  { frame: 448, x: 425, y: 815 },
  { frame: 528, x: 738, y: 508 },
  { frame: 610, x: 1430, y: 362 },
  { frame: 760, x: 1500, y: 820 },
  { frame: 790, x: 1515, y: 835 },
  { frame: 900, x: 1085, y: 520 },
  { frame: 990, x: 1390, y: 405 },
  { frame: 1070, x: 1455, y: 704 },
  { frame: 1145, x: 1430, y: 745 },
  { frame: 1198, x: 1456, y: 745 },
  { frame: 1305, x: 1250, y: 355 },
  { frame: 1410, x: 1435, y: 720 },
  { frame: 1518, x: 1320, y: 438 },
  { frame: 1575, x: 842, y: 656 },
  { frame: 1640, x: 1210, y: 640 },
  { frame: 1680, x: 1560, y: 900 },
];

const clickFrames = [246, 318, 374, 402, 790, 1198, 1518];

export function DemoCursor() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const point = getCursorPoint(frame);
  const opacity = interpolate(
    frame,
    [0, 18, fps * 55.55, fps * 56],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const down = clickFrames.some(
    (clickFrame) => frame >= clickFrame - 2 && frame <= clickFrame + 4,
  );
  const dragging = frame >= 456 && frame <= 528;

  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-50"
      style={{
        opacity,
        transform: `translate3d(${point.x}px, ${point.y}px, 0) scale(${
          down ? 0.9 : 1
        })`,
      }}
    >
      {clickFrames.map((clickFrame) => (
        <CursorRipple key={clickFrame} clickFrame={clickFrame} />
      ))}
      <div
        className="relative"
        style={{
          filter:
            "drop-shadow(0 7px 10px oklch(0% 0 0 / 0.38)) drop-shadow(0 1px 0 oklch(100% 0 0 / 0.35))",
          transform: `translate(-5px, -3px) ${
            dragging ? "rotate(-5deg)" : "rotate(0deg)"
          }`,
        }}
      >
        <svg
          aria-hidden
          className="h-9 w-9"
          viewBox="0 0 34 38"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Demo cursor</title>
          <path
            d="M5 3.5L5.4 31.5L13.2 23.7L18.4 35.5L23.4 33.3L18.1 21.8L30.1 21.4L5 3.5Z"
            fill="oklch(8% 0.005 70)"
            stroke="oklch(98% 0 0)"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
        </svg>
      </div>
    </div>
  );
}

function CursorRipple({ clickFrame }: { clickFrame: number }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [clickFrame, clickFrame + 16], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < clickFrame || frame > clickFrame + 16) {
    return null;
  }

  return (
    <div
      className="absolute left-0 top-0 rounded-full border border-accent"
      style={{
        height: 12 + progress * 52,
        opacity: 1 - progress,
        transform: "translate(-50%, -50%)",
        width: 12 + progress * 52,
      }}
    />
  );
}

function getCursorPoint(frame: number) {
  const nextIndex = cursorPath.findIndex((point) => point.frame >= frame);

  if (nextIndex === -1) {
    return cursorPath[cursorPath.length - 1];
  }

  if (nextIndex === 0) {
    return cursorPath[0];
  }

  const next = cursorPath[nextIndex];
  const previous = cursorPath[nextIndex - 1];

  if (!next) {
    return cursorPath[cursorPath.length - 1];
  }

  const x = interpolate(
    frame,
    [previous.frame, next.frame],
    [previous.x, next.x],
    {
      easing: easeSoft,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const y = interpolate(
    frame,
    [previous.frame, next.frame],
    [previous.y, next.y],
    {
      easing: easeSoft,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return { x, y };
}
