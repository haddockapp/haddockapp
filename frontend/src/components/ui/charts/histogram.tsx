"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FC } from "react";

interface HistogramProps {
  data: { x: string; y: number }[];
  config: ChartConfig;
}

export const Histogram: FC<HistogramProps> = ({ data, config }) => (
  <ChartContainer config={config} className="mx-auto aspect-square h-[400px]">
    <AreaChart
      accessibilityLayer
      data={data}
      margin={{
        left: 12,
        right: 12,
      }}
    >
      <CartesianGrid vertical={false} />
      <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent hideLabel />}
      />
      <Area
        dataKey="y"
        type="step"
        fill="var(--color-y)"
        fillOpacity={0.4}
        stroke="var(--color-y)"
      />
    </AreaChart>
  </ChartContainer>
);
