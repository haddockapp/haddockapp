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
import { Project, Service } from '@prisma/client';
import { WebSocketService } from 'src/websockets/websocket.service';
import ProjectServiceDto from './dto/ProjectService.dto';
import { DockerService } from 'src/docker/docker.service';
import { EnvironmentVar } from './dto/environmentVar';
import axios from 'axios';
import { ServiceAction, ServiceActionDto } from './dto/serviceAction.dto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly vmService: VmService,
    private readonly sourceService: SourceService,
    private readonly networksService: NetworksService,
    private readonly webSocketService: WebSocketService,
    private readonly dockerService: DockerService,
  ) {}

  async updateProject(
    projectId: string,
    data: UpdateProjectDto,
  ): Promise<Project> {
    return await this.projectRepository.updateProject({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        ...(data.authorization_id !== undefined
          ? {
              source: {
                update: {
                  authorizationId: data.authorization_id,
                },
              },
            }
          : {}),
      },
    });
  }

  async deleteProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    this.webSocketService.removeProject(projectId);

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

  async serviceEntityToDto(service: Service): Promise<ProjectServiceDto> {
    const result: ProjectServiceDto = {
      icon: 'https://i.imgur.com/ZMxf3Iy.png',
      ...service,
      environment: JSON.parse(service.environment),
      user: JSON.parse(service.user),
      deployment: JSON.parse(service.deployment),
    };

    const serviceName = service.image.split(':')[0];
    const serviceImage = serviceName.includes('/')
      ? serviceName.replace('/', '%2F')
      : `library%2F${serviceName}`;
    this.dockerService
      .getImageLogo(serviceImage)
      .then((icon) => {
        result.icon = icon;
      })
      .catch((e) => {});
    return result;
  }

  private obfuscateEnvironmentVar(
    environmentVar: EnvironmentVar,
  ): EnvironmentVar {
    return {
      key: environmentVar.key,
      value: environmentVar.isSecret
        ? '*'.repeat(environmentVar.value.length)
        : environmentVar.value,
      isSecret: environmentVar.isSecret,
    };
  }

  private validateEnvironmentVar(environmentVar: EnvironmentVar): boolean {
    const keyRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
    const valueRegex = /^[\x20-\x7E]*$/;

    if (!keyRegex.test(environmentVar.key)) {
      console.log(
        'keyRegex.test(environmentVar.key)',
        keyRegex.test(environmentVar.key),
      );
      return false;
    }
    if (!valueRegex.test(environmentVar.value)) {
      console.log(
        'valueRegex.test(environmentVar.value)',
        valueRegex.test(environmentVar.value),
      );
      return false;
    }
    return true;
  }

  async createEnvironment(
    projectId: string,
    environmentVar: EnvironmentVar,
  ): Promise<EnvironmentVar> {
    if (!this.validateEnvironmentVar(environmentVar)) {
      throw new BadRequestException('Invalid environment variable');
    }

    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const environmentVars: EnvironmentVar[] =
      project.environmentVars as EnvironmentVar[];

    if (environmentVars.some((env) => env.key === environmentVar.key)) {
      throw new BadRequestException('Environment variable already exists');
    }
    environmentVars.push(environmentVar);

    await this.projectRepository.updateEnvironmentVars(
      projectId,
      environmentVars,
    );

    return this.obfuscateEnvironmentVar(environmentVar);
  }

  async updateEnvironment(
    projectId: string,
    key: string,
    data: EnvironmentVar,
  ): Promise<EnvironmentVar> {
    if (!this.validateEnvironmentVar(data)) {
      throw new BadRequestException('Invalid environment variable');
    }

    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const environmentVars: EnvironmentVar[] =
      project.environmentVars as EnvironmentVar[];

    const index = environmentVars.findIndex((env) => env.key === key);
    if (index === -1) {
      throw new NotFoundException('Environment variable not found');
    }

    environmentVars[index] = data;

    await this.projectRepository.updateEnvironmentVars(
      projectId,
      environmentVars,
    );

    return this.obfuscateEnvironmentVar(data);
  }

  async deleteEnvironment(projectId: string, key: string): Promise<void> {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const environmentVars: EnvironmentVar[] =
      project.environmentVars as EnvironmentVar[];

    const index = environmentVars.findIndex((env) => env.key === key);
    if (index === -1) {
      throw new NotFoundException('Environment variable not found');
    }

    environmentVars.splice(index, 1);

    await this.projectRepository.updateEnvironmentVars(
      projectId,
      environmentVars,
    );
  }

  async getEnvironmentVars(projectId: string): Promise<EnvironmentVar[]> {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const obfuscatedEnvironmentVars: EnvironmentVar[] =
      project.environmentVars as EnvironmentVar[];

    return obfuscatedEnvironmentVars.map(this.obfuscateEnvironmentVar);
  }

  private async sendServiceAction(
    ip: string,
    service: string,
    action: ServiceAction,
  ) {
    try {
      const response = await axios.post(`http://${ip}:55001/action`, {
        service,
        action,
      });

      if (response.status !== 200) {
        throw new BadRequestException('Failed to send action');
      }

      if (!response.data.status || response.data.status !== "ok") {
        throw new BadRequestException(response.data);
      }
      return response.data;
    } catch (e) {
      throw new BadRequestException('Failed to send action');
    }
  }

  async serviceAction(projectId: string, data: ServiceActionDto) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const service = project.services.find(
      (service) => service.name === data.service,
    );
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    switch (data.action) {
      case ServiceAction.START:
        return this.sendServiceAction(
          project.vm.ip,
          data.service,
          ServiceAction.START,
        );
      case ServiceAction.STOP:
        return this.sendServiceAction(
          project.vm.ip,
          data.service,
          ServiceAction.STOP,
        );
      case ServiceAction.RESTART:
        return this.sendServiceAction(
          project.vm.ip,
          data.service,
          ServiceAction.RESTART,
        );
      default:
        throw new BadRequestException('Invalid action');
    }
  }
}
