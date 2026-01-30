"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FC } from "react";

interface HistogramProps {
  data: { x: string; y: number }[];
  config: ChartConfig & { [x: string]: { unit: string } };
  domain?: [number, number];
  fillKey: string;
}

export const Histogram: FC<HistogramProps> = ({
  data,
  config,
  domain,
  fillKey,
}) => (
  <ChartContainer
    config={config}
    className="max-h-[900px] w-full min-w-[400px]"
  >
    <AreaChart
      maxBarSize={50}
      accessibilityLayer
      data={data}
      margin={{ right: 50, top: 50 }}
    >
      <CartesianGrid vertical={false} />
      <XAxis
        tickFormatter={(value) =>
          new Date(value).toLocaleString().split(" ")[1]
        }
        dataKey="x"
        tickLine={false}
        axisLine={false}
      />
      <YAxis
        width={70}
        tickFormatter={(value) => {
          if (config.y.label) {
            return `${value} ${config.y.unit}`;
          }
          return value;
        }}
        domain={domain}
        dataKey="y"
        tickLine={false}
        axisLine={false}
      />
      <ChartTooltip
        formatter={(value) => {
          if (config.y.label) {
            return (
              <div className="flex flex-row items-center gap-1 text-sm">
                {config.y.icon ? <config.y.icon /> : null}
                {(+value).toFixed(2)} {config.y.unit}
              </div>
            );
          }
          return value;
        }}
        labelFormatter={(label) => new Date(label).toLocaleString()}
        cursor={false}
        content={<ChartTooltipContent />}
      />
      <defs>
        <linearGradient id={fillKey} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={config.y.color} stopOpacity={0.6} />
          <stop offset="95%" stopColor={config.y.color} stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <Area
        isAnimationActive={false}
        dataKey="y"
        type="step"
        fill={`url(#${fillKey})`}
        stroke="var(--color-y)"
      />
    </AreaChart>
  </ChartContainer>
);
