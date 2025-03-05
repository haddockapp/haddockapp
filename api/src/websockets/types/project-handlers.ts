import { PersistedProjectDto } from "src/project/dto/project.dto";
import { MetricsHandler } from "../handlers/metrics";
import { Handler } from "./handler";
import { LogsHandler } from "../handlers/logs";

export class ProjectHandlers {
    metrics: Handler;
    logs: Handler;

    constructor(project: PersistedProjectDto) {
      this.metrics = new MetricsHandler(project.path);
      this.logs = new LogsHandler(project.path);
    }
  }
