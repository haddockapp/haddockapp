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
} from "@nestjs/common";
import {ProjectRepository} from "./project.repository";
import {CreateProjectDto} from "./dto/CreateProject.dto";
import {UpdateProjectDto} from "./dto/UpdateProject.dto";
import { CurrentUser } from "src/auth/user.context";
import { PersistedUserDto } from "src/user/dto/user.dto";
import { SourceService } from "../source/source.service";
import { ComposeService } from "src/compose/compose.service";
import { DockerService } from "src/docker/docker.service";
import { GithubSourceSettingsDto } from "src/source/dto/settings.dto";
import { getSettings } from "src/source/utils/get-settings";
import ProjectService from "./dto/ProjectService.dto";

@Controller('project')
export class ProjectController {
    constructor(
        private projectRepository: ProjectRepository,
        private sourceService: SourceService,
        private composeService: ComposeService,
        private dockerService: DockerService,
    ) { }

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
    @CurrentUser() user: PersistedUserDto,
    @Body() data: CreateProjectDto,
  ) {
    const project = await this.projectRepository.createProject(
      data,
      user.authorization.id,
    );
    await this.sourceService.deploySource(project.sourceId);
    return project;
  }

    @Patch(':id')
    async updateProject(@Param('id') projectId: string, @Body() data: UpdateProjectDto) {
        const project = await this.projectRepository.findProjectById(projectId);
        if (!project) {
            throw new NotFoundException('Project not found.');
        }

        return await this.projectRepository.updateProject(project.id, data);
    }

    @Delete(':id')
    async deleteProject(@Param('id') projectId: string) {
        await this.projectRepository.deleteProject(projectId);
    }

    @Get(':id/services')
    async getProjectServices(@Param('id') projectId: string) {
        const project = await this.projectRepository.findProjectById(projectId);
        if (!project) {
            throw new NotFoundException('Project not found.');
        }

        const settings = getSettings<GithubSourceSettingsDto>(project?.source.settings);
        const composeContent = this.composeService.readComposeFile(project.id, settings.composeName);

        const services = this.composeService.parseServices(composeContent.toString());
        return await Promise.all(services.map(async (service) => {
            const result: ProjectService = {
                icon: 'https://i.imgur.com/ZMxf3Iy.png',
                image: service.image.startsWith('.') ? 'custom' : service.image,
                name: service.name,
                ports: service.ports,
            };

            const serviceName = service.image.split(':')[0];
            const serviceImage = serviceName.includes('/') ? serviceName.replace('/', '%2F') : `library%2F${serviceName}`;
            this.dockerService.getImageLogo(serviceImage)
                .then((icon) => {
                    result.icon = icon;
                })
                .catch((e) => {});
            return result;
        }));
    }

    @Get(':id/available-ports')
    async getProjectAvailablePorts(@Param('id') projectId: string) {
        const project = await this.projectRepository.findProjectById(projectId);
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const settings = getSettings<GithubSourceSettingsDto>(project?.source.settings);
        const composeContent = this.composeService.readComposeFile(project.id, settings.composeName);
        const services = this.composeService.parseServices(composeContent);
        return services.flatMap((service) => service.ports.map((port) => port.split(':')[0]));
    }
}
