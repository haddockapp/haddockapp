import { useEffect } from "react";
import { useAppDispatch } from "./useStore";
import { backendApi } from "@/services/backendApi";
import { ProjectDto } from "@/services/backendApi/projects";
import { VmState } from "@/types/vm/vm";
import socket from "@/services/websockets";

type SocketMessage = {
  event: string;
  scope: string;
  target: string;
  data: unknown;
};

const useWebsockets = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    socket.connect();

    socket.emit("join", { userId: "abcd" });

    socket.on(
      "metrics",
      ({
        cpuUsage,
        memoryUsage,
      }: {
        cpuUsage: number;
        memoryUsage: number;
      }) => {
        console.log("Metrics", cpuUsage, memoryUsage);
      }
    );

    socket.on("message", (msg: SocketMessage) => {
      console.log(msg);

      dispatch(
        backendApi.util.updateQueryData(
          // @ts-ignore
          "getProjects",
          undefined,
          (draftPosts) => {
            if (msg.event === "status_change") {
              const project = (draftPosts as ProjectDto[]).find(
                (project) => project.id === msg.target
              );
              if (project) {
                project.vm.status = (msg.data as { status: string })
                  .status as VmState;
              }
            }
          }
        )
      );
    });

    return () => {
      socket.disconnect();
      socket.off("message");
    };
  }, []);
};

export default useWebsockets;
