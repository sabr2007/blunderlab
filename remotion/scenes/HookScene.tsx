import { Card } from "@/components/ui/card";
import { useCurrentFrame } from "remotion";
import {
  BoardFrame,
  SceneShell,
  SquareMarker,
  clampProgress,
  useAppear,
} from "../components/SceneShell";
import { type DemoCopy, demoGame } from "../data/demoGame";

export function HookScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const first = useAppear(8, 18, 28);
  const secondProgress = clampProgress(frame, 54, 20);
  const boardProgress = clampProgress(frame, 12, 42);

  return (
    <SceneShell>
      <div
        className="absolute right-[-70px] top-[70px] w-[780px] opacity-45"
        style={{
          filter: "blur(7px)",
          transform: `scale(${0.92 + boardProgress * 0.08})`,
        }}
      >
        <BoardFrame
          fen={demoGame.fenAfter}
          blunderSquare="h5"
          lastMove={{ from: "d1", to: "h5" }}
        >
          <SquareMarker square="h5" start={44} />
        </BoardFrame>
      </div>

      <div className="absolute left-[180px] top-[270px] w-[1040px]">
        <p
          className="text-[82px] font-semibold leading-[0.98] tracking-normal text-fg"
          style={first}
        >
          {copy.hook.lineOne}
        </p>
        <p
          className="mt-8 max-w-[960px] text-[72px] font-semibold leading-[1.02] tracking-normal text-fg-muted"
          style={{
            opacity: secondProgress,
            transform: `translateY(${(1 - secondProgress) * 22}px)`,
          }}
        >
          <span className="text-danger">{copy.hook.lineTwo.split(" ")[0]}</span>{" "}
          {copy.hook.lineTwo.split(" ").slice(1).join(" ")}
        </p>
      </div>

      <Card
        className="absolute bottom-[130px] left-[185px] border-danger/35 bg-danger/10 px-5 py-4"
        style={{
          opacity: clampProgress(frame, 72, 20),
          transform: `translateY(${(1 - clampProgress(frame, 72, 20)) * 16}px)`,
        }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-danger">
          Move 14 · Qh5?
        </p>
      </Card>
    </SceneShell>
  );
}
