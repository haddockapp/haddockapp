import { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";

export enum WebsocketService {
  METRICS = "metrics",
  LOGS = "logs",
  STATUS = "status",
}

export type MetricsSocketType = {
  data: {
    cpu_usage: {
      user: number;
      system: number;
      idle: number;
      percent: number;
    };
    memory_usage: {
      total: number;
      available: number;
      percent: number;
    };
    disk_usage: {
      total: number;
      used: number;
      free: number;
      percent: number;
    };
  };
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
  const socket = getSocket();
  if (!socket) return;

  socket.emit("project", {
    ...data,
    services: [data.service],
  });
  socket.on(data.service, onListen);
}

export { handleProjectSubcription };
export default socket;
