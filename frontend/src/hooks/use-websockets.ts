import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useStore";
import { backendApi } from "@/services/backendApi";
import { VmState } from "@/types/vm/vm";
import {
  EventScope,
  EventType,
  LogsSocketType,
  MetricsSocketType,
  StatusSocketType,
  WebsocketService,
  connectSocket,
  getSocket,
  handleProjectSubcription,
} from "@/services/websockets";
import { ServiceDto } from "@/services/backendApi/services";
import {
  setMetrics,
  setLogs,
  setBuildLogs,
  setAlert,
} from "@/services/metricSlice";
import { ServiceState } from "@/types/services/services";
import {
  updateProjectStatus,
  updateServiceStatus,
} from "@/services/backendApi/projects";

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
              projectId,
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
          dispatch(setLogs({ projectId, logs }));
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
      switch (msg.event) {
        case EventType.STATUS_CHANGE: {
          switch (msg.scope) {
            case EventScope.PROJECT: {
              const { status: newStatus, data } = msg.data as {
                status: VmState;
                data?: { logs: string[] };
              };

              if (data?.logs)
                dispatch(
                  setBuildLogs({
                    projectId: msg.target,
                    buildLogs: data.logs,
                  })
                );

              if (newStatus === VmState.Error)
                dispatch(
                  setAlert({
                    isAlert: true,
                    projectId: msg.target,
                  })
                );

              updateProjectStatus({
                dispatch,
                projectId: msg.target,
                newStatus,
                onSubscribe: subscribe,
                onUnsubscribe: () => unsubscribe(projectId!),
              });
              break;
            }
            case EventScope.SERVICE: {
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
              break;
            }
          }
        }
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
