import { constants } from "@/constants";
import { io } from "socket.io-client";

type Service = "metrics";

interface ProjectEventDto {
  userId: string;
  projectId: string;
  service: Service;
  subscribe: boolean;
  data: any;
}

const socket = io(constants.socketUrl, { autoConnect: false });

const handleProjectSubcription = (data: ProjectEventDto) =>
  socket.emit("project", data);

export { handleProjectSubcription };
export default socket;
