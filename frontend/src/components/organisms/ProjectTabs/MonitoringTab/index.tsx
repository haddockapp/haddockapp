import { FC, useState } from "react";
import LogsSection from "./LogsSection";
import UsageCharts from "./UsageCharts";
import Histograms from "./Histograms";
import useMetrics from "@/hooks/use-metrics";
import {
  ChartPieIcon,
  CpuIcon,
  DiscIcon,
  MemoryStickIcon,
  ScrollTextIcon,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { twMerge } from "tailwind-merge";

type MonitoringTabProps = {
  projectId: string;
};

const MonitoringTab: FC<MonitoringTabProps> = () => {
  const { cpuUsage, memoryUsage, diskUsage, logs, buildLogs } = useMetrics();

  const [expandedLogs, setExpandedLogs] = useState<
    "container" | "build" | null
  >(null);

  const [expandedMetric, setExpandedMetric] = useState<
    "cpu" | "memory" | "disk" | null
  >(null);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mt-8 mb-4">Monitoring</h1>
      {cpuUsage.length === 0 && logs.length === 0 && buildLogs.length === 0 && (
        <p className="text-typography/70">No monitoring data available yet.</p>
      )}

      <div className="flex flex-col md:flex-row w-full gap-4">
        {buildLogs.length > 0 && (
          <div
            className={twMerge(
              "flex flex-col w-full gap-4 overflow-hidden transition-[max-width] duration-300 ease-in-out",
              !expandedLogs || expandedLogs === "build"
                ? "md:max-w-full"
                : "md:max-w-0"
            )}
          >
            <div className="flex flex-row items-center space-x-2">
              <ScrollTextIcon />
              <h3 className="text-lg font-semibold text-typography/80">
                Build logs
              </h3>
            </div>
            <div
              className="cursor-pointer"
              onClick={() =>
                setExpandedLogs((prev) => (prev === null ? "build" : null))
              }
            >
              <LogsSection lines={buildLogs} />
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div
            className={twMerge(
              "flex flex-col w-full gap-4 overflow-hidden transition-[max-width] duration-300 ease-in-out",
              !expandedLogs || expandedLogs === "container"
                ? "md:max-w-full"
                : "md:max-w-0"
            )}
          >
            <div className="flex flex-row items-center space-x-2">
              <ScrollTextIcon />
              <h3 className="text-lg font-semibold text-typography/80">
                Container logs
              </h3>
            </div>
            <div
              className="cursor-pointer"
              onClick={() =>
                setExpandedLogs((prev) => (prev === null ? "container" : null))
              }
            >
              <LogsSection lines={logs} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center space-x-2">
          <ChartPieIcon />
          <h3 className="text-lg font-semibold text-typography/80">Metrics</h3>
        </div>
        <Drawer
          open={!!expandedMetric}
          onClose={() => setExpandedMetric(null)}
          direction="bottom"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 w-full justify-items-center gap-x-12">
            <UsageCharts
              cpuUsage={cpuUsage.at(-1)?.percent ?? 0}
              memoryUsage={memoryUsage.at(-1)?.percent ?? 0}
              diskUsage={diskUsage.at(-1)?.percent ?? 0}
            />
            <Histograms
              onClick={(metric) => setExpandedMetric(metric)}
              cpuData={cpuUsage}
              diskData={diskUsage}
              memoryData={memoryUsage}
            />
          </div>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                <div className="flex flex-row items-center gap-2 text-typography justify-center">
                  {expandedMetric === "cpu" ? (
                    <>
                      <CpuIcon />
                      <span>CPU Usage</span>
                    </>
                  ) : expandedMetric === "memory" ? (
                    <>
                      <MemoryStickIcon />
                      <span>Memory Usage</span>
                    </>
                  ) : expandedMetric === "disk" ? (
                    <>
                      <DiscIcon />
                      <span>Disk Usage</span>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </DrawerTitle>
            </DrawerHeader>
            <div className="w-full p-4">
              <Histograms
                cpuData={expandedMetric === "cpu" ? cpuUsage : undefined}
                diskData={expandedMetric === "disk" ? diskUsage : undefined}
                memoryData={
                  expandedMetric === "memory" ? memoryUsage : undefined
                }
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default MonitoringTab;
