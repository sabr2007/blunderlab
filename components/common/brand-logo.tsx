import { cn } from "@/lib/utils";

type BrandLogoVariant = "horizontal" | "full" | "icon";

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  className?: string;
  alt?: string;
  priority?: boolean;
};

const SOURCES: Record<BrandLogoVariant, { src: string; w: number; h: number }> =
  {
    horizontal: {
      src: "/brand/blunderlab-logo-horizontal-dark.svg",
      w: 350,
      h: 78,
    },
    full: { src: "/brand/blunderlab-logo-full-dark.svg", w: 215, h: 215 },
    icon: { src: "/brand/blunderlab-icon.svg", w: 64, h: 64 },
  };

export function BrandLogo({
  variant = "horizontal",
  className,
  alt = "BlunderLab",
  priority,
}: BrandLogoProps) {
  const { src, w, h } = SOURCES[variant];

  return (
    // Using <img> for SVG keeps original viewBox/scaling semantics; next/image
    // would rasterize a cache layer we don't need for inline brand marks.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("shrink-0", className)}
    />
  );
}
