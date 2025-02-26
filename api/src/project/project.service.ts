import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { VmService } from 'src/vm/vm.service';
import { ProjectRepository } from './project.repository';
import { SourceService } from 'src/source/source.service';
import { NetworksService } from 'src/networks/networks.service';
import { ExecutionError } from 'src/types/error/execution.error';
import { VmState } from 'src/types/vm.enum';
import { execCommand } from 'src/utils/exec-utils';
import { UpdateProjectDto } from './dto/UpdateProject.dto';
import { Project } from '@prisma/client';
import { WebSocketService } from 'src/websockets/websocket.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly vmService: VmService,
    private readonly sourceService: SourceService,
    private readonly networksService: NetworksService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async updateProject(projectId: string, data: UpdateProjectDto): Promise<Project> {

    const project = await this.projectRepository.updateProject({
        where: { id: projectId },
        data: {
            name: data.name,
            description: data.description,
        },
    });

    return project;
  }

  async deleteProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    await this.webSocketService.removeProject(projectId);

    try {
      await this.vmService.deletePhisicalVm(project.vmId);
    } catch (e) {
      if (e instanceof ExecutionError) {
        this.logger.error(`Failed to destroy vm: ${e.message}`);
      }
      return;
    }

    await this.projectRepository.deleteProject(projectId);

    await this.vmService.deleteVmDb(project.vmId);

    await this.sourceService.deleteSource(project.sourceId);

    await this.networksService.updateNetworksfile();

    await execCommand(`rm -rf ${project.path}`);

    this.logger.log(`Project ${projectId} deleted`);
  }

  async deployProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (
      project.vm.status === VmState.Running ||
      project.vm.status === VmState.Starting
    ) {
      throw new BadRequestException('Project is already running');
    }

    this.logger.log(`Deploying project ${project.id}`);

    await this.sourceService.deploySource(project.sourceId);
  }

  async rebuildProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (
      project.vm.status === VmState.Running ||
      project.vm.status === VmState.Starting
    ) {
      throw new BadRequestException('Project is already running');
    }

    this.logger.log(`Rebuilding project ${project.id}`);

    try {
      await this.vmService.deletePhisicalVm(project.vmId);
    } catch (e) {
      if (e instanceof ExecutionError) {
        this.logger.error(`Failed to destroy vm: ${e.message}`);
      }
      return;
    }

    await this.sourceService.deploySource(project.sourceId);
  }
}
