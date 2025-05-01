import RadialTextChart from "@/components/ui/charts/radial-text-chart";
import { CpuIcon, MemoryStickIcon } from "lucide-react";
import { FC } from "react";

type UsageChartsProps = {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
};

const UsageCharts: FC<UsageChartsProps> = ({
  cpuUsage,
  memoryUsage,
  diskUsage,
}) => {
  return (
    <div className="flex flex-row space-x-12 justify-center">
      <div className="flex flex-col space-y-2 w-64">
        <div className="flex flex-row items-center space-x-2 justify-center">
          <CpuIcon />
          <h3 className="text-lg font-semibold text-gray-800 select-none">
            CPU Usage
          </h3>
        </div>
        <RadialTextChart
          valueText={cpuUsage ? `${cpuUsage}%` : "N/A"}
          value={cpuUsage}
          label="CPU Usage"
        />
      </div>
      <div className="flex flex-col space-y-2 text-center w-64">
        <div className="flex flex-row items-center space-x-2 justify-center">
          <MemoryStickIcon />
          <h3 className="text-lg font-semibold text-gray-800  select-none">
            RAM Usage
          </h3>
        </div>
        <RadialTextChart
          valueText={memoryUsage ? `${memoryUsage}%` : "N/A"}
          value={memoryUsage}
          label="RAM Usage"
        />
      </div>
      <div className="flex flex-col space-y-2 text-center w-64">
        <div className="flex flex-row items-center space-x-2 justify-center">
          <MemoryStickIcon />
          <h3 className="text-lg font-semibold text-gray-800  select-none">
            Disk Usage
          </h3>
        </div>
        <RadialTextChart
          valueText={diskUsage ? `${diskUsage}%` : "N/A"}
          value={diskUsage}
          label="Disk Usage"
        />
      </div>
    </div>
  );
};

export default UsageCharts;
