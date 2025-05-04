import MonitoringTab, {
  CpuUsage,
  DiskUsage,
  MemoryUsage,
} from "@/components/organisms/ProjectTabs/MonitoringTab";
import ReactflowTab from "@/components/organisms/ProjectTabs/ReactFlow/ReactflowTab";
import SettingsTab from "@/components/organisms/ProjectTabs/SettingsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch } from "@/hooks/useStore";
import { backendApi } from "@/services/backendApi";
import { ServiceDto } from "@/services/backendApi/services";
import { useGetSelfQuery } from "@/services/backendApi/users";
import {
  getSocket,
  handleProjectSubcription,
  MetricsSocketType,
  WebsocketService,
  LogsSocketType,
  StatusSocketType,
} from "@/services/websockets";
import { ReactFlowProvider } from "@xyflow/react";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

enum TabsValue {
  Topology = "topology",
  Monitoring = "monitoring",
  Settings = "settings",
}

const ProjectDetails: FC = () => {
  const [selectedTab, setSelectedTab] = useState<TabsValue>(TabsValue.Topology);

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
          setCpuUsage((p) =>
            [...p, { ...data.cpu_usage, timestamp }].slice(-50)
          );
          setMemoryUsage((p) =>
            [...p, { ...data.memory_usage, timestamp }].slice(-50)
          );
          setDiskUsage((p) =>
            [...p, { ...data.disk_usage, timestamp }].slice(-50)
          );
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
      ({ status }) => {
        dispatch(
          backendApi.util.updateQueryData(
            "getServicesByProjectId" as never,
            projectId as never,
            (draftPosts) => {
              (draftPosts as unknown as ServiceDto[]).map((service) => {
                const serviceUpdate = status.find(
                  (s) => s.Service === service.name
                );
                if (serviceUpdate) service.status = serviceUpdate;
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
    <Tabs defaultValue="topology">
      <div className="w-full text-right px-8">
        <TabsList>
          <TabsTrigger
            value={TabsValue.Topology}
            onClick={() => setSelectedTab(TabsValue.Topology)}
          >
            <span
              className={
                selectedTab === TabsValue.Topology ? "text-primary" : ""
              }
            >
              Topology
            </span>
          </TabsTrigger>
          <TabsTrigger
            value={TabsValue.Monitoring}
            onClick={() => setSelectedTab(TabsValue.Monitoring)}
          >
            <span
              className={
                selectedTab === TabsValue.Monitoring ? "text-primary" : ""
              }
            >
              Monitoring
            </span>
          </TabsTrigger>
          <TabsTrigger
            value={TabsValue.Settings}
            onClick={() => setSelectedTab(TabsValue.Settings)}
          >
            <span
              className={
                selectedTab === TabsValue.Settings ? "text-primary" : ""
              }
            >
              Settings
            </span>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="topology">
        <ReactFlowProvider>
          <ReactflowTab projectId={projectId ?? ""} />
        </ReactFlowProvider>
      </TabsContent>
      <TabsContent value="monitoring">
        <MonitoringTab
          cpuUsage={cpuUsage}
          diskUsage={diskUsage}
          memoryUsage={memoryUsage}
          logs={logs}
        />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProjectDetails;
