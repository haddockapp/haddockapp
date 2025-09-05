import {
  BadRequestException,
  forwardRef,
  Inject,
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
import { ServiceStatus } from 'src/types/service.enum';
import { EventScope, EventType } from 'src/websockets/dto/websocket-event.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { SecurityAdvicesDto } from 'src/project/dto/securityAdvices.dto';
import { GithubSourceSettingsDto } from 'src/source/dto/settings.dto';
import { getSettings } from 'src/source/utils/get-settings';
import { ComposeService } from 'src/compose/compose.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly projectRepository: ProjectRepository,
    @Inject(forwardRef(() => VmService))
    private readonly vmService: VmService,
    private readonly sourceService: SourceService,
    private readonly networksService: NetworksService,
    private readonly webSocketService: WebSocketService,
    private readonly dockerService: DockerService,
    @InjectQueue('deploys') private readonly deployQueue: Queue,
    private readonly composeService: ComposeService,
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

  async stopProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    await this.deployQueue.add('stop', project);
  }

  async startProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    await this.deployQueue.add('start', project);
  }

  async deployProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (
      project.vm.status === VmState.Running ||
      project.vm.status === VmState.Starting ||
      project.vm.status === VmState.Stopping
    ) {
      throw new BadRequestException('Project is already running');
    }

    this.logger.log(`Deploying project ${project.id}`);

    await this.sourceService.deploySource(project.sourceId);
  }

  async recreateProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (
      project.vm.status === VmState.Running ||
      project.vm.status === VmState.Starting ||
      project.vm.status === VmState.Stopping
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
      icon: 'https://img.icons8.com/?size=48&id=cdYUlRaag9G9&format=png',
      ...service,
      environment: JSON.parse(service.environment),
      user: JSON.parse(service.user),
      deployment: JSON.parse(service.deployment),
      status: service.status as ServiceStatus,
      statusTimeStamp: service.statusTimeStamp,
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

  async updateServiceStatus(
    projectId: string,
    serviceId: string,
    status: ServiceStatus,
  ) {
    await this.projectRepository.updateServiceStatus(
      projectId,
      serviceId,
      status,
    );

    this.webSocketService.notifyAll({
      scope: EventScope.SERVICE,
      event: EventType.STATUS_CHANGE,
      target: projectId,
      data: {
        service: serviceId,
        status,
      },
    });
  }

  async updateAllServiceStatus(projectId: string, status: ServiceStatus) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const services = project.services;

    for (const service of services) {
      await this.updateServiceStatus(projectId, service.id, status);
    }
  }

  private actionToStatus(action: ServiceAction): ServiceStatus {
    switch (action) {
      case ServiceAction.START:
        return ServiceStatus.Running;
      case ServiceAction.STOP:
        return ServiceStatus.Stopped;
      case ServiceAction.RESTART:
        return ServiceStatus.Running;
      default:
        throw new BadRequestException('Invalid action');
    }
  }

  private async sendServiceAction(
    projectId: string,
    ip: string,
    serviceName: string,
    serviceId: string,
    action: ServiceAction,
  ) {
    try {
      const response = await axios.post(`http://${ip}:55001/action`, {
        service: serviceName,
        action,
      });

      if (response.status !== 200) {
        throw new BadRequestException('Failed to send action');
      }

      if (!response.data.status || response.data.status !== 'ok') {
        throw new BadRequestException(response.data);
      }

      const status = this.actionToStatus(action);

      await this.updateServiceStatus(projectId, serviceId, status);

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
      (service) => service.id === data.service,
    );
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    switch (data.action) {
      case ServiceAction.START:
        if (service.status === ServiceStatus.Running) {
          throw new BadRequestException('Service is already running');
        }
        return await this.sendServiceAction(
          projectId,
          project.vm.ip,
          service.name,
          service.id,
          ServiceAction.START,
        );
      case ServiceAction.STOP:
        if (service.status === ServiceStatus.Stopped) {
          throw new BadRequestException('Service is already stopped');
        }
        return await this.sendServiceAction(
          projectId,
          project.vm.ip,
          service.name,
          service.id,
          ServiceAction.STOP,
        );
      case ServiceAction.RESTART:
        if (service.status === ServiceStatus.Stopped) {
          throw new BadRequestException('Service is already stopped');
        }
        return await this.sendServiceAction(
          projectId,
          project.vm.ip,
          service.name,
          service.id,
          ServiceAction.RESTART,
        );
      default:
        throw new BadRequestException('Invalid action');
    }
  }

  async getSecurityAdvices(projectId: string): Promise<SecurityAdvicesDto[]> {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    const source = await this.sourceService.findSourceById(project.sourceId);
    if (!source) throw new NotFoundException('Source not found');

    if (source.type !== 'github')
      throw new BadRequestException('Source is not a github repository');

    const settings = getSettings<GithubSourceSettingsDto>(source.settings);
    const composePath = `./${process.env.SOURCE_DIR}/${settings.composePath}`;

    const rawCompose = this.composeService.readComposeFile(
      projectId,
      composePath,
    );
    if (!rawCompose) throw new NotFoundException('Compose file not found');

    const services = this.composeService.parseServices(rawCompose.toString());

    const securityAdvices: SecurityAdvicesDto[] = [];

    for (const service of services) {
      if (!service.environment || typeof service.environment !== 'object')
        continue;

      for (const [key, value] of Object.entries(service.environment)) {
        // Password should be binded to an environment variable
        if (key.includes('PASSWORD') && !/^\$[^$]/.test(value)) {
          securityAdvices.push({
            type: 'EXPOSED_ENV',
            data: {
              service: service.name,
              variable: key,
            },
          });
        }

        // add more checks here...
      }
    }

    return securityAdvices;
  }
}
