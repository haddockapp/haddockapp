import { useGetSelfQuery } from "@/services/backendApi/users";
import {
  getSocket,
  handleProjectSubcription,
  LogsSocketType,
  MetricsSocketType,
  StatusSocketType,
  WebsocketService,
} from "@/services/websockets";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LogsSection from "./LogsSection";
import UsageCharts from "./UsageCharts";
import Histograms from "./Histograms";
import { useAppDispatch } from "@/hooks/useStore";
import { backendApi } from "@/services/backendApi";
import { ServiceDto } from "@/services/backendApi/services";

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

const MonitoringTab: FC = () => {
  const dispatch = useAppDispatch();

  const { projectId } = useParams();

  const { data: me } = useGetSelfQuery();

  const [cpuUsage, setCpuUsage] = useState<CpuUsage[]>([]);
  const [diskUsage, setDiskUsage] = useState<DiskUsage[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage[]>([]);

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
          setCpuUsage((p) => [...p, { ...data.cpu_usage, timestamp }]);
          setMemoryUsage((p) => [...p, { ...data.memory_usage, timestamp }]);
          setDiskUsage((p) => [...p, { ...data.disk_usage, timestamp }]);
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

    handleProjectSubcription<StatusSocketType>(
      {
        projectId,
        service: WebsocketService.STATUS,
        subscribe: true,
        userId: me.id,
        data: {},
      },
      (data) => {
        dispatch(
          backendApi.util.updateQueryData(
            "getServicesByProjectId" as never,
            undefined as never,
            (draftPosts) => {
              (draftPosts as unknown as ServiceDto[]).map((service) => {
                const serviceUpdate = data.find((s) => s.Name === service.name);
                if (serviceUpdate) service.status = serviceUpdate.State;
                return service;
              });
            }
          )
        );
      }
    );

    return () => {
      socket.off(WebsocketService.METRICS);
      socket.off(WebsocketService.LOGS);
      socket.off(WebsocketService.STATUS);
    };
  }, [cpuUsage, diskUsage, dispatch, me, memoryUsage, projectId]);

  return (
    <div className="px-8 space-y-8">
      <h1 className="text-3xl font-bold mt-8 mb-4">Monitoring</h1>
      <div className="grid grid-cols-3 w-fit mx-auto justify-items-center gap-x-12">
        <UsageCharts
          cpuUsage={cpuUsage[-1]?.percent}
          memoryUsage={memoryUsage[-1]?.percent}
          diskUsage={diskUsage[-1]?.percent}
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
