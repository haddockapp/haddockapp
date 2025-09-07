import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useStore";
import { backendApi } from "@/services/backendApi";
import { VmState } from "@/types/vm/vm";
import { ProjectDto } from "@/services/backendApi/projects/projects.dto";
import {
  LogsSocketType,
  MetricsSocketType,
  StatusSocketType,
  WebsocketService,
  connectSocket,
  getSocket,
  handleProjectSubcription,
} from "@/services/websockets";
import { ServiceDto } from "@/services/backendApi/services";
import { setMetrics, setLogs } from "@/services/metricSlice";
import { ServiceState } from "@/types/services/services";
import { updateServiceStatus } from "@/services/backendApi/projects";

type SocketMessage = {
  event: string;
  scope: string;
  target: string;
  data: unknown;
};

const useWebsockets = () => {
  const dispatch = useAppDispatch();
  const { clientId } = useAppSelector((state) => state.auth);

  const { socketUrl } = useAppSelector((state) => state.config);
  const { projectId, oldProjectId } = useAppSelector((state) => state.metrics);

  const unsubscribe = (unsubscribeProjectId: string) => {
    if (!clientId) return;
    const socket = getSocket();
    if (!socket) return;

    if (!unsubscribeProjectId) return;

    console.log(`UNSUBSCRIBE ${unsubscribeProjectId}`);
    socket.emit("project", {
      projectId: unsubscribeProjectId,
      services: [
        WebsocketService.METRICS,
        WebsocketService.LOGS,
        WebsocketService.STATUS,
      ],
      subscribe: false,
      userId: clientId,
      data: {},
    });
    return;
  };

  const subscribe = async () => {
    if (!clientId) return;
    if (!projectId) return;

    console.log(`SUBSCRIBE ${projectId}`);
    await handleProjectSubcription<MetricsSocketType>(
      {
        projectId,
        service: WebsocketService.METRICS,
        subscribe: true,
        userId: clientId,
        data: {},
      },
      ({ data }) => {
        if (data) {
          dispatch(
            setMetrics({
              cpuUsage: data.cpu_usage,
              diskUsage: data.disk_usage,
              memoryUsage: data.memory_usage,
            })
          );
        }
      }
    );

    await handleProjectSubcription<LogsSocketType>(
      {
        projectId,
        service: WebsocketService.LOGS,
        subscribe: true,
        userId: clientId,
        data: {},
      },
      ({ logs }) => {
        if (logs) {
          dispatch(setLogs(logs));
        }
      }
    );

    await handleProjectSubcription<StatusSocketType>(
      {
        projectId,
        service: WebsocketService.STATUS,
        subscribe: true,
        userId: clientId,
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
                const isDirty =
                  JSON.stringify(serviceUpdate) !==
                  JSON.stringify(service.status);

                if (serviceUpdate && isDirty) {
                  service.statusDetails = serviceUpdate;
                }
              });
            }
          )
        );
      }
    );
  };

  useEffect(() => {
    if (!clientId || !socketUrl) return;

    connectSocket(socketUrl);

    const socket = getSocket();
    if (!socket) return;

    socket.connect();

    socket.emit("join", { userId: clientId });

    socket.on("message", (msg: SocketMessage) => {
      if (msg.scope === "project" && msg.event === "status_change")
        dispatch(
          backendApi.util.updateQueryData(
            "getProjects" as never,
            undefined as never,
            (draftPosts) => {
              if (msg.scope === "project" && msg.event === "status_change") {
                const project = (draftPosts as unknown as ProjectDto[]).find(
                  (project) => project.id === msg.target
                );
                if (project) {
                  project.vm.status = (msg.data as { status: string })
                    .status as VmState;

                  if (project.vm.status === VmState.Running) {
                    subscribe();
                  } else {
                    if (project.vm.status === VmState.Stopping && projectId) {
                      unsubscribe(projectId);
                    }
                  }
                }
              }
            }
          )
        );
      if (msg.scope === "service" && msg.event === "status_change") {
        const { service: serviceId, status: newStatus } = msg.data as {
          service: string;
          status: ServiceState;
        };

        setTimeout(() => {
          updateServiceStatus({
            dispatch,
            projectId: msg.target,
            serviceId,
            newStatus,
          });
        }, 100);
      }
    });

    return () => {
      socket.disconnect();
      socket.off("message");
    };
  }, [dispatch, clientId, socketUrl, projectId]);

  useEffect(() => {
    if (!projectId && oldProjectId) {
      unsubscribe(oldProjectId);
    }
    subscribe();

    return () => {
      const socket = getSocket();
      if (!socket) return;
      socket.off(WebsocketService.METRICS);
      socket.off(WebsocketService.LOGS);
      socket.off(WebsocketService.STATUS);
    };
  }, [dispatch, clientId, projectId, oldProjectId]);
};

export default useWebsockets;
