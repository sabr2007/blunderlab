"use client";

import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PatternTrendPoint = {
  label: string;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
};

export function PatternTrendChart({ data }: { data: PatternTrendPoint[] }) {
  const t = useTranslations("dashboard");

  return (
    <div className="h-72 w-full md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="blunders" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-danger)"
                stopOpacity={0.36}
              />
              <stop
                offset="95%"
                stopColor="var(--color-danger)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="mistakes" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-warning)"
                stopOpacity={0.32}
              />
              <stop
                offset="95%"
                stopColor="var(--color-warning)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              color: "var(--color-text)",
            }}
          />
          <Area
            type="monotone"
            dataKey="blunders"
            name={t("chartBlunders")}
            stroke="var(--color-danger)"
            fill="url(#blunders)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="mistakes"
            name={t("chartMistakes")}
            stroke="var(--color-warning)"
            fill="url(#mistakes)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="inaccuracies"
            name={t("chartInaccuracies")}
            stroke="var(--color-accent)"
            fill="transparent"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
