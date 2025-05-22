import RadialTextChart from "@/components/ui/charts/radial-text-chart";
import { CpuIcon, DiscIcon, MemoryStickIcon } from "lucide-react";
import { FC } from "react";

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
      <h3 className="text-lg font-semibold text-gray-800 select-none">
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
    <UsageChart
      title="CPU Usage"
      color="hsl(var(--chart-2))"
      icon={<CpuIcon />}
      value={cpuUsage}
    />
    <UsageChart
      title="Memory Usage"
      color="hsl(var(--chart-1))"
      icon={<MemoryStickIcon />}
      value={memoryUsage}
    />
    <UsageChart
      title="Disk Usage"
      color="hsl(var(--chart-4))"
      icon={<DiscIcon />}
      value={diskUsage}
    />
  </>
);

export default UsageCharts;
