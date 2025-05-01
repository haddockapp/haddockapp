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

const MonitoringTab: FC = () => {
  const { projectId } = useParams();

  const { data: me } = useGetSelfQuery();

  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [diskUsage, setDiskUsage] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!projectId || !me) return;

    handleProjectSubcription<MetricsSocketType>(
      {
        projectId,
        service: WebsocketService.METRICS,
        subscribe: true,
        userId: me.id,
        data: {},
      },
      ({ cpu_usage, disk_usage, memory_usage }) => {
        if (cpuUsage) setCpuUsage(cpu_usage.percent);
        if (memoryUsage) setMemoryUsage(memory_usage.percent);
        if (diskUsage) setDiskUsage(disk_usage.percent);
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
        if (logs) setLogs(logs);
      }
    );

    const socket = getSocket();
    if (!socket) return;
    return () => {
      socket.off("metrics");
      socket.off("logs");
    };
  }, [cpuUsage, diskUsage, me, memoryUsage, projectId]);

  return (
    <div>
      <h1 className="text-3xl font-bold mt-8 mb-4">Monitoring</h1>
      <div className="flex flex-col space-y-4">
        <UsageCharts cpuUsage={cpuUsage} memoryUsage={memoryUsage} />
        <LogsSection lines={logs} />
      </div>
    </div>
  );
};

export default MonitoringTab;
