import { Injectable } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VmProvider } from '../types/vm.enum';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { PersistedProjectDto } from './dto/project.dto';
import pirateShips from './pirateShips';

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
}
