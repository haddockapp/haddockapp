import { FC } from "react";
import LogsSection from "./LogsSection";
import UsageCharts from "./UsageCharts";
import Histograms from "./Histograms";

export type CpuUsage = {
  user: number;
  system: number;
  idle: number;
  percent: number;

  timestamp: Date;
};

export type MemoryUsage = {
  total: number;
  available: number;
  percent: number;

  timestamp: Date;
};

export type DiskUsage = {
  total: number;
  percent: number;
  used: number;
  free: number;

  timestamp: Date;
};

const MonitoringTab: FC<{
  cpuUsage: CpuUsage[];
  diskUsage: DiskUsage[];
  memoryUsage: MemoryUsage[];
  logs: string[];
}> = ({ cpuUsage, diskUsage, memoryUsage, logs }) => (
  <div className="px-8 space-y-8">
    <h1 className="text-3xl font-bold mt-8 mb-4">Monitoring</h1>
    <div className="grid grid-cols-3 w-fit mx-auto justify-items-center gap-x-12">
      <UsageCharts
        cpuUsage={cpuUsage.at(-1)?.percent ?? 0}
        memoryUsage={memoryUsage.at(-1)?.percent ?? 0}
        diskUsage={diskUsage.at(-1)?.percent ?? 0}
      />
      <Histograms
        cpuData={cpuUsage}
        diskData={diskUsage}
        memoryData={memoryUsage}
      />
    </div>
    <div>
      <LogsSection lines={logs} />
    </div>
  </div>
);

export default MonitoringTab;
