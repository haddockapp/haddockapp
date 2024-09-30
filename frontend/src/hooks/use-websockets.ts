import { useEffect } from "react";
import { io } from "socket.io-client";
import { constants } from "../constants";
// import { ProjectDto } from "@/types/projects/projects.dto";

type SocketMessage = {
  event: string;
  scope: string;
  target: string;
  data: unknown;
};

const socket = io(constants.socketUrl, { autoConnect: false });

const useWebsockets = () => {
  useEffect(() => {
    socket.connect();

    socket.emit("join", { userId: "abcd" });

    socket.on("message", (msg: SocketMessage) => {
      console.log(msg);

      //   if (msg.event === "status_change") {
      //     queryClient.setQueryData(
      //       [QueryTags.PROJECTS],
      //       (oldData: ProjectDto[]) => {
      //         const newData = (oldData as ProjectDto[]).map((project) => ({
      //           ...project,
      //           vm: {
      //             ...project.vm,
      //             status:
      //               project.id === msg.target
      //                 ? (msg.data as { status: string }).status
      //                 : project.vm.status,
      //           },
      //         }));
      //         return newData;
      //       }
      //     );
      //   } else {
      //     console.log(msg.event);
      //   }
    });

    return () => {
      socket.disconnect();
      socket.off("message");
    };
  }, []);
};

export default useWebsockets;
