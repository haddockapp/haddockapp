import { Histogram } from "@/components/ui/charts/histogram";
import { CpuIcon, DiscIcon, MemoryStickIcon } from "lucide-react";
import { FC } from "react";
import { MetricData } from ".";

const Histograms: FC<{
  diskData: MetricData[];
  memoryData: MetricData[];
  cpuData: MetricData[];
}> = ({ diskData, memoryData, cpuData }) => (
  <>
    <Histogram
      config={{
        y: {
          label: "CPU Usage",
          color: "hsl(var(--chart-2))",
          icon: CpuIcon,
        },
      }}
      data={cpuData.map((data) => ({
        x: new Date(data.timestamp).toString(),
        y: data.value,
      }))}
    />
    <Histogram
      config={{
        y: {
          label: "Memory Usage",
          color: "hsl(var(--chart-1))",
          icon: MemoryStickIcon,
        },
      }}
      data={memoryData.map((data) => ({
        x: new Date(data.timestamp).toString(),
        y: data.value,
      }))}
    />
    <Histogram
      config={{
        y: {
          label: "Disk Usage",
          color: "hsl(var(--chart-4))",
          icon: DiscIcon,
        },
      }}
      data={diskData.map((data) => ({
        x: new Date(data.timestamp).toString(),
        y: data.value,
      }))}
    />
  </>
);

export default Histograms;
