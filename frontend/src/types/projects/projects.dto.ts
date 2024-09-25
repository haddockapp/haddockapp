import { Source } from "../source";
import { VMInfos } from "../vm/vm";

export interface ProjectDto {
  id: string;
  sourceId: string;
  vmId: string;
  vm: VMInfos;
  source: Source;
}
