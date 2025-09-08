import { FC } from "react";
import LogsSection from "./LogsSection";
import UsageCharts from "./UsageCharts";
import Histograms from "./Histograms";
import useMetrics from "@/hooks/use-metrics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChartPieIcon, ScrollTextIcon } from "lucide-react";

type MonitoringTabProps = {
  projectId: string;
};

const MonitoringTab: FC<MonitoringTabProps> = () => {
  const { cpuUsage, memoryUsage, diskUsage, logs, buildLogs } = useMetrics();

  return (
    <div className="px-8 space-y-8">
      <h1 className="text-3xl font-bold mt-8 mb-4">Monitoring</h1>
      <Accordion
        type="multiple"
        defaultValue={["build-logs", "metrics", "logs"]}
      >
        {buildLogs.length > 0 && (
          <AccordionItem value="build-logs">
            <AccordionTrigger>
              <div className="flex flex-row items-center space-x-2">
                <ScrollTextIcon />
                <h3 className="text-lg font-semibold text-typography/80">
                  Build logs
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div>
                <LogsSection lines={buildLogs} />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {cpuUsage.length > 0 &&
          memoryUsage.length > 0 &&
          diskUsage.length > 0 && (
            <AccordionItem value="metrics">
              <AccordionTrigger>
                <div className="flex flex-row items-center space-x-2">
                  <ChartPieIcon />
                  <h3 className="text-lg font-semibold text-typography/80">
                    Metrics
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>
          )}
        {logs.length > 0 && (
          <AccordionItem value="logs">
            <AccordionTrigger>
              <div className="flex flex-row items-center space-x-2">
                <ScrollTextIcon />
                <h3 className="text-lg font-semibold text-typography/80">
                  Docker logs
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div>
                <LogsSection lines={logs} />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default MonitoringTab;
