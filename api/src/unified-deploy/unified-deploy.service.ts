import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RedirectDto, UnifiedDeployDto } from './dto/unified-project.dto';
import { Project } from '@prisma/client';
import { CreateZipUploadSourceDto } from 'src/source/dto/create-source.dto';
import { CreateProjectDto } from 'src/project/dto/CreateProject.dto';
import { DomainsService } from 'src/domains/domains.service';
import { ProjectService } from 'src/project/project.service';
import { CreateNetworkConnectionDto } from 'src/networks/dto/CreateNetworkConnectionDto';
import { NetworksService } from 'src/networks/networks.service';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { SourceService } from 'src/source/source.service';
import * as fs from 'node:fs';
import { ZipUploadSourceSettingsDto } from 'src/source/dto/settings.dto';
import { DeployCodeService } from './deploy-code/deploy-code.service';

@Injectable()
export class UnifiedDeployService {
  private readonly logger = new Logger(UnifiedDeployService.name);

  constructor(
    private readonly projectService: ProjectService,
    private readonly domainService: DomainsService,
    private readonly networkService: NetworksService,
    private readonly sourceService: SourceService,
    private readonly deployCodeService: DeployCodeService,
  ) {}

  private async resolveRedirectionsDomains(
    project: Project,
    redirects: RedirectDto[],
  ): Promise<CreateNetworkConnectionDto[]> {
    const domainIdCache: Map<string, string> = new Map<string, string>();

    const dtos: CreateNetworkConnectionDto[] = [];

    for (const redirect of redirects) {
      const domainId: string = domainIdCache.get(redirect.domain);

      if (domainId === undefined) {
        const domain = await this.domainService.findDomainByName(
          redirect.domain,
        );

        if (!domain) {
          throw new Error(`Domain not found: ${redirect.domain}`);
        }

        domainIdCache.set(redirect.domain, domain.id);

        dtos.push({
          domainId: domain.id,
          projectId: project.id,
          port: redirect.port,
          prefix: redirect.prefix ?? '',
        });
      } else {
        dtos.push({
          domainId,
          projectId: project.id,
          port: redirect.port,
          prefix: redirect.prefix ?? '',
        });
      }
    }
    return dtos;
  }

  private async networkHandling(
    dto: UnifiedDeployDto,
    project: Project,
  ): Promise<void> {
    if (dto.redirects && dto.redirects.length > 0) {
      const networkConnectionDtos: CreateNetworkConnectionDto[] =
        await this.resolveRedirectionsDomains(project, dto.redirects);

      for (const netDto of networkConnectionDtos) {
        await this.networkService.createNetworkConnection(netDto);
      }
    }
  }

  async deploy(
    file: Express.Multer.File,
    dto: UnifiedDeployDto,
  ): Promise<Project> {
    try {
      await this.deployCodeService.validate(dto.deploy_code);
    } catch (error) {
      if (file) {
        fs.unlinkSync(file.path);
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new UnauthorizedException(
          'Invalid, expired, or already used deploy code',
        );
      }
    }

    if (!file) {
      throw new BadRequestException('ZIP file is required');
    }

    const createSourceDto: CreateZipUploadSourceDto =
      new CreateZipUploadSourceDto();
    createSourceDto.compose_path = dto.compose_path;
    createSourceDto.environmentVars = dto.env || [];

    const projectCreationData: CreateProjectDto = {
      vm_memory: dto.ram,
      vm_disk: dto.disk,
      vm_cpus: dto.cpu,
      source: createSourceDto,
    };

    try {
      const project: PersistedProjectDto =
        await this.projectService.createProject(projectCreationData);
      this.logger.log(`Created project with ID: ${project.id}`);

      try {
        await this.networkHandling(dto, project);
      } catch (error) {
        this.logger.error(
          `Failed to create network connections: ${error.message}`,
        );
        await this.projectService.deleteProject(project.id);
        throw error;
      }

      const finalZipPath = `../uploads/${project.id}.zip`;

      fs.renameSync(file.path, finalZipPath);

      const newSettings: Partial<ZipUploadSourceSettingsDto> = {
        status: 'uploaded',
      };

      await this.sourceService.updateSourceSettings(
        project.sourceId,
        newSettings,
      );

      await this.sourceService.deploySource(project.sourceId, false);

      const updatedProject: PersistedProjectDto =
        await this.projectService.findProjectById(project.id);

      return updatedProject;
    } catch (error) {
      this.logger.error(`Failed to create project: ${error.message}`);
      fs.unlinkSync(file.path);
      throw error;
    }
  }
}
