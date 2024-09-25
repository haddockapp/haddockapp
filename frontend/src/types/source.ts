import { Settings } from "./github/github.dto";

export type Source = {
  id: string;
  type: string;
  authorizationId: string;
  settings: Settings;
};
