import { constants } from "@/constants";
import { io } from "socket.io-client";

export enum WebsocketService {
  Metrics = "metrics",
  Logs = "logs",
}

export type MetricsSocketType = {
  cpuUsage: number;
  memoryUsage: number;
};

export type LogsSocketType = {
  logs: string[];
};

interface ProjectEventDto {
  userId: string;
  projectId: string;
  service: WebsocketService;
  subscribe: boolean;
  data: unknown;
}

const socket = io(constants.socketUrl, { autoConnect: false });

function handleProjectSubcription<T extends MetricsSocketType | LogsSocketType>(
  data: ProjectEventDto,
  onListen: (res: T) => void
) {
  socket.emit("project", data);
  socket.on(data.service, onListen);
}

export { handleProjectSubcription };
export default socket;
