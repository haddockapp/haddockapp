import RadialTextChart from "@/components/ui/charts/radial-text-chart";
import socket, { handleProjectSubcription } from "@/services/websockets";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface MetricsSocketType {
  cpuUsage: number;
  memoryUsage: number;
}

const MonitoringTab: FC = () => {
  const { projectId } = useParams();

  const [cpuUsage, setCpuUsage] = useState<number>(50);
  const [memoryUsage, setMemoryUsage] = useState<number>(50);

  useEffect(() => {
    if (!projectId) return;

    handleProjectSubcription({
      projectId,
      service: "metrics",
      subscribe: true,
      userId: "abcd",
      data: {},
    });

    socket.on("metrics", ({ cpuUsage, memoryUsage }: MetricsSocketType) => {
      setCpuUsage(cpuUsage);
      setMemoryUsage(memoryUsage);
    });

    return () => {
      handleProjectSubcription({
        projectId,
        service: "metrics",
        subscribe: false,
        userId: "abcd",
        data: {},
      });
    };
  }, [projectId]);

  return (
    <div className="mx-8">
      <h1 className="text-3xl font-bold mt-8 mb-4">Monitoring</h1>
      <div className="flex flex-row space-x-12 justify-center">
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
