import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { ComposeService } from 'src/compose/compose.service';
import { DockerService } from 'src/docker/docker.service';
import { GithubSourceSettingsDto } from 'src/source/dto/settings.dto';
import { getSettings } from 'src/source/utils/get-settings';
import { SourceService } from '../source/source.service';
import { CreateProjectDto } from './dto/CreateProject.dto';
import ProjectServiceDto from './dto/ProjectService.dto';
import { UpdateProjectDto } from './dto/UpdateProject.dto';
import { ProjectRepository } from './project.repository';
import { ProjectService } from './project.service';
import { EnvironmentVar } from './dto/environmentVar';
import { ServiceActionDto } from './dto/serviceAction.dto';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectRepository: ProjectRepository,
    private readonly sourceService: SourceService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Get()
  async findAllProjects() {
    return await this.projectRepository.findAllProjects();
  }

  @Get(':id')
  async findProjectById(@Param('id') projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(@Body() data: CreateProjectDto) {
    const canReadSource = await this.authorizationService.canReadSource(
      data.authorization_id,
      data.repository_organisation,
      data.repository_name,
    );
    if (!canReadSource) {
      throw new BadRequestException(
        'Provided authorization does not have access to the repository.',
      );
    }
    const project = await this.projectRepository.createProject(data);
    await this.sourceService.deploySource(project.sourceId, false);
    return project;
  }

  @Post('/stop/:id')
  async stopProject(@Param('id') projectId: string) {
    await this.projectService.stopProject(projectId);
  }

  @Post('/start/:id')
  async startProject(@Param('id') projectId: string) {
    await this.projectService.startProject(projectId);
  }

  @Post('/pull/:id')
  async deployProject(@Param('id') projectId: string) {
    await this.projectService.deployProject(projectId);
  }

  @Post('/recreate/:id')
  async recreateProject(@Param('id') projectId: string) {
    await this.projectService.recreateProject(projectId);
  }

  @Patch(':id')
  async updateProject(
    @Param('id') projectId: string,
    @Body() data: UpdateProjectDto,
  ) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    if (data.authorization_id !== undefined) {
      const { organization, repository } = getSettings<GithubSourceSettingsDto>(
        project.source.settings,
      );
      const canReadSource = await this.authorizationService.canReadSource(
        data.authorization_id,
        organization,
        repository,
      );

      if (!canReadSource) {
        throw new BadRequestException(
          'Provided authorization does not have access to the repository.',
        );
      }
    }

    return await this.projectService.updateProject(project.id, data);
  }

  @Delete(':id')
  async deleteProject(@Param('id') projectId: string) {
    await this.projectService.deleteProject(projectId);
  }

  @Get(':id/service')
  async getProjectServices(
    @Param('id') projectId: string,
  ): Promise<ProjectServiceDto[]> {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return await Promise.all(
      project.services.map(async (service) => {
        return this.projectService.serviceEntityToDto(service);
      }),
    );
  }

  @Get(':id/service/:serviceId')
  async getProjectServiceInformations(
    @Param('id') projectId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<ProjectServiceDto> {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const service = project.services.find(
      (service) => service.id === serviceId,
    );
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return this.projectService.serviceEntityToDto(service);
  }

  @Post(':id/environment')
  @HttpCode(HttpStatus.CREATED)
  async createEnvironment(
    @Param('id') projectId: string,
    @Body() data: EnvironmentVar,
  ) {
    return await this.projectService.createEnvironment(projectId, data);
  }

  @Patch(':id/environment/:key')
  async updateEnvironment(
    @Param('id') projectId: string,
    @Param('key') key: string,
    @Body() data: EnvironmentVar,
  ) {
    return await this.projectService.updateEnvironment(projectId, key, data);
  }

  @Delete(':id/environment/:key')
  async deleteEnvironment(
    @Param('id') projectId: string,
    @Param('key') key: string,
  ) {
    await this.projectService.deleteEnvironment(projectId, key);
  }

  @Get(':id/environment')
  async getEnvironmentVars(
    @Param('id') projectId: string,
  ): Promise<EnvironmentVar[]> {
    return await this.projectService.getEnvironmentVars(projectId);
  }

  @Post(':id/service')
  async serviceAction(
    @Param('id') projectId: string,
    @Body() data: ServiceActionDto,
  ) {
    return await this.projectService.serviceAction(projectId, data);
  }
}
