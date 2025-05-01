import { useGetSelfQuery } from "@/services/backendApi/users";
import {
  getSocket,
  handleProjectSubcription,
  LogsSocketType,
  MetricsSocketType,
  WebsocketService,
} from "@/services/websockets";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LogsSection from "./LogsSection";
import UsageCharts from "./UsageCharts";
import Histograms from "./Histograms";

export type MetricData = { value: number; timestamp: Date };

const MonitoringTab: FC = () => {
  const { projectId } = useParams();

  const { data: me } = useGetSelfQuery();

  const [cpuUsage, setCpuUsage] = useState<MetricData[]>([]);
  const [diskUsage, setDiskUsage] = useState<MetricData[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<MetricData[]>([]);

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!projectId || !me) return;
    const socket = getSocket();
    if (!socket) return;

    handleProjectSubcription<MetricsSocketType>(
      {
        projectId,
        service: WebsocketService.METRICS,
        subscribe: true,
        userId: me.id,
        data: {},
      },
      ({ data }) => {
        const timestamp = new Date();
        if (data) {
          setCpuUsage((p) => [
            ...p,
            { value: data.cpu_usage.percent, timestamp },
          ]);
          setMemoryUsage((p) => [
            ...p,
            { value: data.memory_usage.percent, timestamp },
          ]);
          setDiskUsage((p) => [
            ...p,
            { value: data.disk_usage.percent, timestamp },
          ]);
        }
      }
    );

    handleProjectSubcription<LogsSocketType>(
      {
        projectId,
        service: WebsocketService.LOGS,
        subscribe: true,
        userId: me.id,
        data: {},
      },
      ({ logs }) => {
        if (logs) {
          setLogs(logs);
        }
      }
    );

    handleProjectSubcription(
      {
        projectId,
        service: WebsocketService.STATUS,
        subscribe: true,
        userId: me.id,
        data: {},
      },
      (data) => {
        console.log(data);
      }
    );

    return () => {
      socket.off(WebsocketService.METRICS);
      socket.off(WebsocketService.LOGS);
      socket.off(WebsocketService.STATUS);
    };
  }, [cpuUsage, diskUsage, me, memoryUsage, projectId]);

  return (
    <div className="px-8">
      <h1 className="text-3xl font-bold mt-8 mb-4">Monitoring</h1>
      <div className="grid grid-cols-3 justify-items-center">
        <UsageCharts
          cpuUsage={cpuUsage[-1]?.value}
          memoryUsage={memoryUsage[-1]?.value}
          diskUsage={diskUsage[-1]?.value}
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
};

export default MonitoringTab;
