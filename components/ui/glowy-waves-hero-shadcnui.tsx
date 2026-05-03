"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { type Variants, motion } from "framer-motion";
import { ArrowRight, CirclePlay, Goal, Sparkles, Target } from "lucide-react";
import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

type HeroCopy = {
  pill: string;
  title: string;
  titleAccent: string;
  text: string;
  primaryCta: string;
  secondaryCta: string;
  signals: [string, string, string];
};

type WaveConfig = {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
};

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const waves: WaveConfig[] = [
  {
    offset: 0,
    amplitude: 54,
    frequency: 0.003,
    color: "rgba(245, 167, 70, 0.92)",
    opacity: 0.5,
  },
  {
    offset: Math.PI / 2,
    amplitude: 76,
    frequency: 0.0024,
    color: "rgba(255, 124, 55, 0.86)",
    opacity: 0.36,
  },
  {
    offset: Math.PI,
    amplitude: 44,
    frequency: 0.0038,
    color: "rgba(255, 209, 133, 0.64)",
    opacity: 0.28,
  },
  {
    offset: Math.PI * 1.5,
    amplitude: 64,
    frequency: 0.002,
    color: "rgba(180, 98, 36, 0.72)",
    opacity: 0.24,
  },
];

function splitTitle(title: string, accent: string) {
  const index = title.toLowerCase().indexOf(accent.toLowerCase());
  if (index === -1) {
    return { before: title, accent: "", after: "" };
  }

  return {
    before: title.slice(0, index),
    accent: title.slice(index, index + accent.length),
    after: title.slice(index + accent.length),
  };
}

export function GlowyWavesHero({ copy }: { copy: HeroCopy }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });
  const titleParts = splitTitle(copy.title, copy.titleAccent);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let time = 0;
    let dpr = window.devicePixelRatio || 1;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resizeCanvas = () => {
      const rect = section.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const center = { x: rect.width / 2, y: rect.height / 2 };
      mouseRef.current = center;
      targetMouseRef.current = center;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      targetMouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      const rect = section.getBoundingClientRect();
      const center = { x: rect.width / 2, y: rect.height / 2 };
      targetMouseRef.current = center;
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(section);
    resizeCanvas();

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    const drawWave = (wave: WaveConfig, width: number, height: number) => {
      const mouseInfluence = prefersReducedMotion ? 8 : 58;
      const influenceRadius = prefersReducedMotion ? 160 : 300;

      ctx.save();
      ctx.beginPath();

      for (let x = 0; x <= width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = height * 0.5 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const mouseEffect =
          influence *
          mouseInfluence *
          Math.sin(time * 0.001 + x * 0.01 + wave.offset);

        const y =
          height * 0.5 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) *
            wave.amplitude +
          Math.sin(x * wave.frequency * 0.42 + time * 0.003) *
            (wave.amplitude * 0.42) +
          mouseEffect;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineWidth = 2.4;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = 34;
      ctx.shadowColor = wave.color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const smoothing = prefersReducedMotion ? 0.04 : 0.1;

      time += prefersReducedMotion ? 0.35 : 1;
      mouseRef.current.x +=
        (targetMouseRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y +=
        (targetMouseRef.current.y - mouseRef.current.y) * smoothing;

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#14110f");
      gradient.addColorStop(0.52, "#0f0e0c");
      gradient.addColorStop(1, "#1d1712");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      for (const wave of waves) {
        drawWave(wave, width, height);
      }

      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[82svh] overflow-hidden border-b border-border/70 bg-bg"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 -z-10 h-full w-full"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,14,12,0.12)_42%,rgba(15,14,12,0.86)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(15,14,12,0.08),rgba(15,14,12,0.42)_62%,rgba(15,14,12,0.94))]"
      />

      <div className="container relative z-10 flex min-h-[82svh] items-center py-14 md:py-18 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-bg/55 px-3.5 py-1.5 text-xs text-fg-muted backdrop-blur-xl"
          >
            <span className="relative inline-flex">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="absolute inset-0 size-1.5 rounded-full bg-accent pulse-dot" />
            </span>
            {copy.pill}
          </motion.span>

          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="mt-6 text-balance text-[clamp(3rem,5.1vw,5.25rem)] font-semibold leading-[1.02] tracking-normal"
          >
            {titleParts.before}
            {titleParts.accent ? (
              <span className="text-amber-emphasis">{titleParts.accent}</span>
            ) : null}
            {titleParts.after}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-pretty mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted"
          >
            {copy.text}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="rounded-full px-5">
              <Link href="/sign-in">
                {copy.primaryCta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full bg-bg/50 px-5 backdrop-blur-xl"
            >
              <a href="#demo">
                <CirclePlay className="size-4" />
                {copy.secondaryCta}
              </a>
            </Button>
          </motion.div>

          <motion.ul
            variants={itemVariants}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-fg-subtle"
          >
            <li className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-accent" />
              {copy.signals[0]}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Target className="size-3.5 text-accent" />
              {copy.signals[1]}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Goal className="size-3.5 text-accent" />
              {copy.signals[2]}
            </li>
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
