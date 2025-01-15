import { from } from "env-var";

const vars = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
};

const env = from(vars, {});

export const constants = {
  socketUrl: env
    .get("VITE_SOCKET_URL")
    .default("http://localhost:3001")
    .asString(),
};
