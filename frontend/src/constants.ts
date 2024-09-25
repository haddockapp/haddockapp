import { from } from "env-var";

const vars = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
};

const env = from(vars, {});

export const constants = {
  apiUrl: env.get("VITE_API_URL").default("http://localhost:3000").asString(),
  socketUrl: env
    .get("VITE_SOCKET_URL")
    .default("http://localhost:3001")
    .asString(),
  githubClientId: env.get("VITE_GITHUB_CLIENT_ID").required().asString(),
};
