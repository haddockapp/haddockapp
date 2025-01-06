import {
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
import { ProjectRepository } from './project.repository';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { UpdateProjectDto } from './dto/UpdateProject.dto';
import { CurrentUser } from 'src/auth/user.context';
import { PersistedUserDto } from 'src/user/dto/user.dto';
import { SourceService } from '../source/source.service';
import { ComposeService } from 'src/compose/compose.service';
import { DockerService } from 'src/docker/docker.service';
import { GithubSourceSettingsDto } from 'src/source/dto/settings.dto';
import { getSettings } from 'src/source/utils/get-settings';
import ProjectServiceDto from './dto/ProjectService.dto';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectRepository: ProjectRepository,
    private readonly sourceService: SourceService,
    private readonly composeService: ComposeService,
    private readonly dockerService: DockerService,
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
  async createProject(
    @Body() data: CreateProjectDto,
  ) {
    const canReadSource = await this.authorizationService.canReadSource(data.authorization_id, data.repository_organisation, data.repository_name);
    if (!canReadSource) {
      throw new BadRequestException('Provided authorization does not have access to the repository.');
    }
    const project = await this.projectRepository.createProject(
      data
    );
    await this.sourceService.deploySource(project.sourceId);
    return project;
  }

  @Post('/deploy/:id')
  async deployProject(@Param('id') projectId: string) {
    await this.projectService.deployProject(projectId);
  }

  @Post('/rebuild/:id')
  async rebuildProject(@Param('id') projectId: string) {
    await this.projectService.rebuildProject(projectId);
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

    return await this.projectRepository.updateProject(project.id, data);
  }

  @Delete(':id')
  async deleteProject(@Param('id') projectId: string) {
    await this.projectService.deleteProject(projectId);
  }

  @Get(':id/service')
  async getProjectServices(@Param('id') projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const settings = getSettings<GithubSourceSettingsDto>(
      project?.source.settings,
    );
    const rawCompose = this.composeService.readComposeFile(
      project.id,
      settings.composeName,
    );
    if (!rawCompose) {
      return [];
    }

    const services = this.composeService.parseServices(rawCompose.toString());
    return await Promise.all(
      services.map(async (service) => {
        const result: ProjectServiceDto = {
          icon: 'https://i.imgur.com/ZMxf3Iy.png',
          image: service.image.startsWith('.') ? 'custom' : service.image,
          name: service.name,
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
      }),
    );
  }

  @Get(':id/service/:name')
  async getProjectServiceInformations(
    @Param('id') projectId: string,
    @Param('name') serviceName: string,
  ) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const settings = getSettings<GithubSourceSettingsDto>(
      project?.source.settings,
    );
    const rawCompose = this.composeService.readComposeFile(
      project.id,
      settings.composeName,
    );
    if (!rawCompose) {
      throw new NotFoundException('Service not found');
    }

    const services = this.composeService.parseServices(rawCompose);
    const service = services.find((service) => service.name === serviceName);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }
}
