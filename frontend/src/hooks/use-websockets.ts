import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useStore";
import { backendApi } from "@/services/backendApi";
import { VmState } from "@/types/vm/vm";
import socket from "@/services/websockets";
import { toast } from "./use-toast";
import { ProjectDto } from "@/services/backendApi/projects/projects.dto";
import { useGetSelfQuery } from "@/services/backendApi/users";

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

  useEffect(() => {
    if (!me) return;

    socket.connect();

    socket.emit("join", { userId: me.id });

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
  }, [dispatch, me]);
};

export default useWebsockets;
