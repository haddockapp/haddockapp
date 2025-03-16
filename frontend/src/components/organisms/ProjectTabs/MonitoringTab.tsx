import RadialTextChart from "@/components/ui/charts/radial-text-chart";
import { useGetSelfQuery } from "@/services/backendApi/users";
import socket, { handleProjectSubcription } from "@/services/websockets";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";

interface MetricsSocketType {
  cpuUsage: number;
  memoryUsage: number;
}

interface LogsSocketType {
  logs: string[];
}

const MonitoringTab: FC = () => {
  const { projectId } = useParams();

  const { data: me } = useGetSelfQuery();

  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!projectId || !me) return;

    handleProjectSubcription({
      projectId,
      service: "metrics",
      subscribe: true,
      userId: me.id,
      data: {},
    });

    handleProjectSubcription({
      projectId,
      service: "logs",
      subscribe: true,
      userId: me.id,
      data: {},
    });

    socket.on("metrics", ({ cpuUsage, memoryUsage }: MetricsSocketType) => {
      setCpuUsage(cpuUsage);
      setMemoryUsage(memoryUsage);
    });

    socket.on("logs", ({ logs }: LogsSocketType) => {
      console.log(logs);
      setLogs(logs);
    });

    return () => {
      socket.off("metrics");
    };
  }, [me, projectId]);

  return (
    <div>
      <h1 className="text-3xl font-bold mt-8 mb-4">Monitoring</h1>
      <div className="flex flex-row space-x-12 justify-center">
        <div style={{ height: 500, width: 902 }}>
          <ScrollFollow
            startFollowing={true}
            render={({ follow, onScroll }) => (
              <LazyLog
                text={logs?.join("\n")}
                stream
                follow={follow}
                onScroll={onScroll}
              />
            )}
          />
        </div>
        ,
        <div className="flex flex-col space-y-2 text-center">
          <h3 className="text-lg font-semibold text-gray-800">CPU Usage</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <RadialTextChart
            valueText={`${cpuUsage}%`}
            value={cpuUsage}
            label="CPU Usage"
          />
        </div>
        <div className="flex flex-col space-y-2 text-center">
          <h3 className="text-lg font-semibold text-gray-800">RAM Usage</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <RadialTextChart
            valueText={`${memoryUsage}%`}
            value={memoryUsage}
            label="RAM Usage"
          />
        </div>
      </div>
    </div>
  );
};

export default MonitoringTab;
