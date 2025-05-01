"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FC } from "react";
import { Card } from "@/components/ui/card";

interface HistogramProps {
  data: { x: string; y: number }[];
  config: ChartConfig & { [x: string]: { unit: string } };
  domain?: [number, number];
}

export const Histogram: FC<HistogramProps> = ({ data, config, domain }) => (
  <Card className="p-0 w-full min-w-[400px]">
    <ChartContainer
      config={config}
      className="mx-auto aspect-square w-full min-w-[400px]"
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
        <Area
          dataKey="y"
          type="step"
          fill="var(--color-y)"
          fillOpacity={0.4}
          stroke="var(--color-y)"
        />
      </AreaChart>
    </ChartContainer>
  </Card>
);
