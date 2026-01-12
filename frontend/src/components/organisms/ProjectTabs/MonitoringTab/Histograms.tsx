import { Histogram } from "@/components/ui/charts/histogram";
import { Skeleton } from "@/components/ui/skeleton";
import { DiskUsage, MemoryUsage, CpuUsage } from "@/services/metricSlice";
import { CpuIcon, DiscIcon, MemoryStickIcon } from "lucide-react";
import { FC } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

const Histograms: FC<{
  diskData?: DiskUsage[];
  memoryData?: MemoryUsage[];
  cpuData?: CpuUsage[];
  onClick?: (metric: "cpu" | "memory" | "disk") => void;
}> = ({ diskData = [], memoryData = [], cpuData = [], onClick }) => (
  <>
    <motion.button
      onClick={() => onClick?.("cpu")}
      className={twMerge("w-full", cpuData.length < 2 && "hidden")}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <Skeleton loading={cpuData.length < 2}>
        <Histogram
          fillKey="cpu-usage-histogram"
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
            x: new Date(data.timestamp!).toString(),
            y: data.percent,
          }))}
        />
      </Skeleton>
    </motion.button>
    <motion.div
      onClick={() => onClick?.("memory")}
      className={twMerge("w-full", memoryData.length < 2 && "hidden")}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <Skeleton loading={memoryData.length < 2}>
        <Histogram
          fillKey="memory-usage-histogram"
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
            x: new Date(data.timestamp!).toString(),
            y: (data.total - data.available) / 1024 ** 2,
          }))}
        />
      </Skeleton>
    </motion.div>
    <motion.div
      onClick={() => onClick?.("disk")}
      className={twMerge("w-full", diskData.length < 2 && "hidden")}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <Skeleton loading={diskData.length < 2}>
        <Histogram
          fillKey="disk-usage-histogram"
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
            x: new Date(data.timestamp!).toString(),
            y: data.used / 1024 ** 3,
          }))}
        />
      </Skeleton>
    </motion.div>
  </>
);

export default Histograms;
