import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

type Props = {
  className?: string;
  label: string;
  caption?: string;
  videoSrc?: string;
  videoType?: string;
  poster?: string;
};

export function LaptopMockup({
  className,
  label,
  caption,
  videoSrc,
  videoType = "video/mp4",
  poster,
}: Props) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl", className)}>
      <div className="laptop-frame">
        <div className="laptop-screen relative grid place-items-center bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,oklch(78%_0.16_72/0.10),transparent_70%)]">
          {videoSrc ? (
            <video
              key={videoSrc}
              className="absolute inset-0 size-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={poster}
              aria-label={label}
            >
              <source src={videoSrc} type={videoType} />
            </video>
          ) : (
            <>
              <div className="lab-grid pointer-events-none absolute inset-0 opacity-30" />
              <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                <span className="grid size-16 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent shadow-[0_0_0_8px_oklch(78%_0.16_72/0.06)] transition group-hover:scale-105">
                  <Play className="size-6 fill-current" />
                </span>
                <p className="text-eyebrow text-fg-subtle">{label}</p>
                {caption ? (
                  <p className="max-w-sm text-sm text-fg-muted">{caption}</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="laptop-stand" />
    </div>
  );
}
