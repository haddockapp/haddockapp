import { useEffect } from "react";
import { useAppDispatch } from "./useStore";
import { backendApi } from "@/services/backendApi";
import { ProjectDto } from "@/services/backendApi/projects/projects.service";
import { VmState } from "@/types/vm/vm";
import socket from "@/services/websockets";
import { toast } from "./use-toast";

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

    socket.on("message", (msg: SocketMessage) => {
      toast({
        title: "Websocket message",
        description: JSON.stringify(msg),
      });

      dispatch(
        backendApi.util.updateQueryData(
          "getProjects" as never,
          undefined as never,
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
  }, [dispatch]);
};

export default useWebsockets;
