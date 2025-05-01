import { Histogram } from "@/components/ui/charts/histogram";
import { CpuIcon, DiscIcon, MemoryStickIcon } from "lucide-react";
import { FC } from "react";
// import cpuUsage from "./cpuUsage.json";
// import diskUsage from "./diskUsage.json";
// import memoryUsage from "./memoryUsage.json";
import { CpuUsage, DiskUsage, MemoryUsage } from ".";

const Histograms: FC<{
  diskData: DiskUsage[];
  memoryData: MemoryUsage[];
  cpuData: CpuUsage[];
}> = ({ diskData, memoryData, cpuData }) => (
  <>
    <Histogram
      domain={[0, 100]}
      config={{
        y: {
          label: "CPU Usage",
          unit: "%",
          color: "hsl(var(--chart-2))",
          icon: CpuIcon,
        },
      }}
      data={cpuData.map((data) => ({
        x: new Date(data.timestamp).toString(),
        y: data.percent,
      }))}
    />
    <Histogram
      domain={[0, +(memoryData[0]?.total / 1024 ** 2).toFixed(0)]}
      config={{
        y: {
          label: `Memory Usage`,
          unit: "MB",
          color: "hsl(var(--chart-1))",
          icon: MemoryStickIcon,
        },
      }}
      data={memoryData.map((data) => ({
        x: new Date(data.timestamp).toString(),
        y: (data.total - data.available) / 1024 ** 2,
      }))}
    />
    <Histogram
      domain={[0, +(diskData[0]?.total / 1024 ** 3).toFixed(0)]}
      config={{
        y: {
          label: "Disk Usage",
          unit: "GB",
          color: "hsl(var(--chart-4))",
          icon: DiscIcon,
        },
      }}
      data={diskData.map((data) => ({
        x: new Date(data.timestamp).toString(),
        y: data.used / 1024 ** 3,
      }))}
    />
  </>
);

export default Histograms;
