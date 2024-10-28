import { PersistedProjectDto } from "src/project/dto/project.dto";
import { MetricsHandler } from "../handlers/metrics";
import { Handler } from "./handler";

export class ProjectHandlers {
    metrics: Handler;

    constructor(project: PersistedProjectDto) {
      this.metrics = new MetricsHandler(project.path);
    }
  }
