import { Injectable } from '@nestjs/common';
import { Prisma, Project, Service } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VmProvider } from '../types/vm.enum';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { PersistedProjectDto } from './dto/project.dto';
import pirateShips from './pirateShips';
import { ServiceDto } from 'src/compose/model/Service';
import { EnvironmentVar } from './dto/environmentVar';
import { ServiceStatus } from 'src/types/service.enum';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllProjects(): Promise<PersistedProjectDto[]> {
    return this.prismaService.project.findMany({
      include: {
        vm: true,
        source: true,
      },
    });
  }

  async findProjectById(
    projectId: string,
  ): Promise<PersistedProjectDto | null> {
    return this.prismaService.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        vm: true,
        source: true,
        networkConnections: true,
        services: true,
      },
    });
  }

  private generatePirateShipName(): string {
    const { prefixes, suffixes } = pirateShips;

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix} ${suffix}`;
  }

  async createProject(data: CreateProjectDto): Promise<Project> {
    return this.prismaService.project.create({
      data: {
        name: this.generatePirateShipName(),
        vm: {
          create: {
            memory: data.vm_memory,
            disk: data.vm_disk,
            cpus: data.vm_cpus,
            provider: VmProvider.Libvirt,
          },
        },
        source: {
          create: {
            type: 'github',
            settings: {
              organization: data.repository_organisation,
              repository: data.repository_name,
              branch: data.repository_branch,
              composePath: data.compose_path,
            },
            ...(data.authorization_id
              ? {
                  authorization: {
                    connect: { id: data.authorization_id },
                  },
                }
              : {}),
          },
        },
      },
    });
  }

  async updateProject(params: {
    where: Prisma.ProjectWhereUniqueInput;
    data: Prisma.ProjectUpdateInput;
  }): Promise<Project> {
    const { where, data } = params;

    return this.prismaService.project.update({
      data: data,
      where,
    });
  }

  async deleteProject(projectId: string) {
    return this.prismaService.project.delete({
      where: {
        id: projectId,
      },
    });
  }

  async addServiceToProject(projectId: string, service: ServiceDto) {
    return this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        services: {
          create: {
            ...service,
            environment: JSON.stringify(service.environment),
            user: JSON.stringify(service.user),
            deployment: JSON.stringify(service.deployment),
          },
        },
      },
    });
  }

  async setServicesToProject(projectId: string, services: ServiceDto[]) {
    return this.prismaService.$transaction([
      this.prismaService.service.deleteMany({
        where: { projectId },
      }),
      this.prismaService.project.update({
        where: { id: projectId },
        data: {
          services: {
            createMany: {
              data: services.map((service) => ({
                ...service,
                environment: JSON.stringify(service.environment),
                user: JSON.stringify(service.user),
                deployment: JSON.stringify(service.deployment),
              })),
            },
          },
        },
      }),
    ]);
  }

  async removeServiceFromProject(projectId: string, serviceName: string) {
    return this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        services: {
          delete: {
            name: serviceName,
          },
        },
      },
    });
  }

  async getProjectServices(projectId: string): Promise<Service[]> {
    return this.prismaService.service.findMany({
      where: {
        projectId,
      },
    });
  }

  async getProjectService(
    projectId: string,
    serviceName: string,
  ): Promise<Service | null> {
    return this.prismaService.service.findFirst({
      where: {
        projectId,
        name: serviceName,
      },
    });
  }

  async updateServiceStatus(
    projectId: string,
    serviceName: string,
    status: ServiceStatus,
  ) {
    await this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        services: {
          update: {
            where: {
              name: serviceName,
            },
            data: {
              status: status,
              statusTimeStamp: new Date(),
            },
          },
        },
      },
    });
  }

  async updateEnvironmentVars(
    projectId: string,
    environmentVars: EnvironmentVar[],
  ) {
    return this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        environmentVars: {
          set: environmentVars,
        },
      },
    });
  }
}
