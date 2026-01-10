import RadialTextChart from "@/components/ui/charts/radial-text-chart";
import { CpuIcon, DiscIcon, MemoryStickIcon } from "lucide-react";
import { FC } from "react";
import { motion } from "framer-motion";

type UsageChartsProps = {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
};

const UsageChart: FC<{
  title: string;
  color: string;
  icon: React.ReactNode;
  value: number;
}> = ({ title, color, icon, value }) => (
  <div className="flex flex-col space-y-2 w-64">
    <div className="flex flex-row items-center space-x-2 justify-center">
      {icon}
      <h3 className="text-lg font-semibold text-typography/80 select-none">
        {title}
      </h3>
    </div>
    <RadialTextChart
      valueText={value ? `${value}%` : "N/A"}
      value={value}
      label={title}
      color={color}
    />
  </div>
);

const UsageCharts: FC<UsageChartsProps> = ({
  cpuUsage,
  memoryUsage,
  diskUsage,
}) => (
  <>
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <UsageChart
        title="CPU Usage"
        color="hsl(var(--chart-2))"
        icon={<CpuIcon />}
        value={cpuUsage}
      />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <UsageChart
        title="Memory Usage"
        color="hsl(var(--chart-1))"
        icon={<MemoryStickIcon />}
        value={memoryUsage}
      />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <UsageChart
        title="Disk Usage"
        color="hsl(var(--chart-4))"
        icon={<DiscIcon />}
        value={diskUsage}
      />
    </motion.div>
  </>
);

export default UsageCharts;
