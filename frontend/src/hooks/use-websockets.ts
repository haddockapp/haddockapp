import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useStore";
import { backendApi } from "@/services/backendApi";
import { VmState } from "@/types/vm/vm";
import { ProjectDto } from "@/services/backendApi/projects/projects.dto";
import { useGetSelfQuery } from "@/services/backendApi/users";
import { connectSocket, getSocket } from "@/services/websockets";

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

  useEffect(() => {
    if (!me || !socketUrl) return;

    connectSocket(socketUrl);

    const socket = getSocket();
    if (!socket) return;

    socket.connect();

    socket.emit("join", { userId: me.id });

    socket.on("message", (msg: SocketMessage) => {
      dispatch(
        backendApi.util.updateQueryData(
          "getProjects" as never,
          undefined as never,
          (draftPosts) => {
            if (msg.event === "status_change") {
              const project = (draftPosts as unknown as ProjectDto[]).find(
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
  }, [dispatch, me, socketUrl]);
};

export default useWebsockets;
