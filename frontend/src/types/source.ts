import { SourceType } from "@/services/backendApi/projects/sources.dto";
import { SourceSettingsDto } from "./github/github.dto";

export type Source = {
  id: string;
  type: SourceType;
  authorizationId: string;
  settings: SourceSettingsDto;
};
