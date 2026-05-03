import { useCurrentFrame } from "remotion";
import {
  BrandLockup,
  SceneShell,
  clampProgress,
  easeSoft,
} from "../components/SceneShell";
import type { DemoCopy } from "../data/demoGame";

export function FinalScene({ copy }: { copy: DemoCopy }) {
  const frame = useCurrentFrame();
  const reveal = clampProgress(frame, 0, 20, easeSoft);

  return (
    <SceneShell>
      <div className="absolute inset-0 grid place-items-center bg-bg/55 backdrop-blur-sm">
        <div
          className="text-center"
          style={{
            opacity: reveal,
            transform: `translateY(${(1 - reveal) * 22}px) scale(${
              0.98 + reveal * 0.02
            })`,
          }}
        >
          <p className="text-[64px] font-semibold leading-[1.05] tracking-normal">
            {copy.dashboard.finalLineOne}
          </p>
          <p className="mt-2 text-[72px] font-semibold leading-[1.05] tracking-normal text-accent">
            {copy.dashboard.finalLineTwo}
          </p>
          <div className="mx-auto mt-14 flex w-fit items-center gap-5 rounded-md border border-border bg-surface/85 px-8 py-6 shadow-2xl shadow-black/50">
            <BrandLockup />
            <div className="h-12 w-px bg-border" />
            <p className="max-w-[360px] text-left text-xl leading-snug text-fg-muted">
              {copy.dashboard.lockupText}
            </p>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}
