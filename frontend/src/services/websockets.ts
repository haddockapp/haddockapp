import { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";

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

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export function connectSocket(url: string) {
  if (socket) {
    socket.disconnect();
  }
  socket = io(url);
  return socket;
}

export function getSocket() {
  return socket;
}

function handleProjectSubcription<T extends MetricsSocketType | LogsSocketType>(
  data: ProjectEventDto,
  onListen: (res: T) => void
) {
  const s = getSocket();
  if (!s) return;
  s.emit("project", data);
  s.on(data.service, onListen);
}

export { handleProjectSubcription };
export default socket;
