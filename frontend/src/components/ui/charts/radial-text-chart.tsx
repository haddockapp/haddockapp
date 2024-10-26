"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { FC, useMemo } from "react";

interface RadialTextChartProps {
  label?: string;
  value: number;
  valueText?: string;
  max?: number;
}
const RadialTextChart: FC<RadialTextChartProps> = ({
  label,
  value,
  valueText = value,
  max = 100,
}) => {
  const chartData = useMemo(
    () => [
      {
        value,
        fill: "var(--color-safari)",
      },
    ],
    [value]
  );
  const chartConfig = useMemo(
    () => ({
      value: {
        label: "Value",
      },
      safari: {
        label: "Safari",
        color: "hsl(var(--primary))",
      },
    }),
    []
  );

  return (
    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[200px]"
      >
        <RadialBarChart
          data={chartData}
          startAngle={0}
          endAngle={(value / max) * 360}
          innerRadius={80}
          outerRadius={110}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-background"
            polarRadius={[86, 74]}
          />
          <RadialBar dataKey="value" background cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-4xl font-bold"
                      >
                        {valueText}
                      </tspan>
                      {label && (
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {label}
                        </tspan>
                      )}
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </CardContent>
  );
};

export default RadialTextChart;
