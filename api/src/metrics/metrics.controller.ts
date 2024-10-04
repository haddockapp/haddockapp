import { Controller, Get, Param } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { ProjectRepository } from 'src/project/project.repository';

@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly vmMetricsService: MetricsService,
    private readonly projectRepository: ProjectRepository,
  ) {}

  @Get(':projectId/cpu')
  async getCpuUsage(
    @Param('projectId') projectId: string,
  ): Promise<{ cpuUsage: number }> {
    const project: PersistedProjectDto =
      await this.projectRepository.findProjectById(projectId);

    const cpuUsage = await this.vmMetricsService.getCpuUsage(project.path);

    return { cpuUsage };
  }

  @Get(':projectId/memory')
  async getMemoryUsage(
    @Param('projectId') projectId: string,
  ): Promise<{ memoryUsage: number }> {
    const project: PersistedProjectDto =
      await this.projectRepository.findProjectById(projectId);

    const memoryUsage = await this.vmMetricsService.getMemoryUsage(
      project.path,
    );

    return { memoryUsage };
  }
}
