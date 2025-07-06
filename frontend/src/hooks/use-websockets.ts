import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useStore";
import { backendApi } from "@/services/backendApi";
import { VmState } from "@/types/vm/vm";
import { ProjectDto } from "@/services/backendApi/projects/projects.dto";
import { useGetSelfQuery } from "@/services/backendApi/users";
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

type SocketMessage = {
  event: string;
  scope: string;
  target: string;
  data: unknown;
};

const useWebsockets = () => {
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector((state) => state.auth);
  const { data: me } = useGetSelfQuery(undefined, { skip: !isAuth });

  const { socketUrl } = useAppSelector((state) => state.config);
  const { projectId, oldProjectId } = useAppSelector((state) => state.metrics);

  const unsubscribe = (unsubscribeProjectId: string) => {
    if (!me) return;
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
      userId: me.id,
      data: {},
    });
    return;
  };

  const subscribe = async () => {
    if (!me) return;
    if (!projectId) return;

    console.log(`SUBSCRIBE ${projectId}`);
    await handleProjectSubcription<MetricsSocketType>(
      {
        projectId,
        service: WebsocketService.METRICS,
        subscribe: true,
        userId: me.id,
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
        userId: me.id,
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
    if (!me || !socketUrl) return;

    connectSocket(socketUrl);

    const socket = getSocket();
    if (!socket) return;

    socket.connect();

    socket.emit("join", { userId: me.id });

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
                    if (project.vm.status === VmState.Stopped && projectId) {
                      unsubscribe(projectId);
                    }
                  }
                }
              }
            }
          )
        );
      if (msg.scope === "service" && msg.event === "status_change")
        dispatch(
          backendApi.util.updateQueryData(
            "getServicesByProjectId" as never,
            projectId as never,
            (draftPosts) => {
              (draftPosts as unknown as ServiceDto[]).map((service) => {
                const data = msg.data as { service: string; status: string };
                if (service.id !== data.service) return;
                const isDirty =
                  JSON.stringify(data.status) !==
                  JSON.stringify(service.status);

                if (isDirty) {
                  service.status = data.status;
                }
              });
            }
          )
        );
    });

    return () => {
      socket.disconnect();
      socket.off("message");
    };
  }, [dispatch, me, socketUrl, projectId]);

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
  }, [dispatch, me, projectId, oldProjectId]);
};

export default useWebsockets;
