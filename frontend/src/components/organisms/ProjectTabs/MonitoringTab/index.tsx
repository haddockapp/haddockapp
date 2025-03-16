import { useGetSelfQuery } from "@/services/backendApi/users";
import socket, {
  handleProjectSubcription,
  LogsSocketType,
  MetricsSocketType,
  WebsocketService,
} from "@/services/websockets";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import testData from "../testData.json";
import LogsSection from "./LogsSection";
import UsageCharts from "./UsageCharts";

const MonitoringTab: FC = () => {
  const { projectId } = useParams();

  const { data: me } = useGetSelfQuery();

  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>(testData);

  useEffect(() => {
    if (!projectId || !me) return;

    handleProjectSubcription<MetricsSocketType>(
      {
        projectId,
        service: WebsocketService.Metrics,
        subscribe: true,
        userId: me.id,
        data: {},
      },
      ({ cpuUsage, memoryUsage }) => {
        if (cpuUsage) setCpuUsage(cpuUsage);
        if (memoryUsage) setMemoryUsage(memoryUsage);
      }
    );

    handleProjectSubcription<LogsSocketType>(
      {
        projectId,
        service: WebsocketService.Logs,
        subscribe: true,
        userId: me.id,
        data: {},
      },
      ({ logs }) => {
        if (logs) setLogs(logs);
      }
    );

    return () => {
      socket.off("metrics");
      socket.off("logs");
    };
  }, [me, projectId]);

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
