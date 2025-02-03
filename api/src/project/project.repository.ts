import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VmProvider } from '../types/vm.enum';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { UpdateProjectDto } from './dto/UpdateProject.dto';
import { PersistedProjectDto } from './dto/project.dto';
import pirateShips from './pirateShips';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prismaService: PrismaService) { }

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

  async createProject(
    data: CreateProjectDto,
  ): Promise<Project> {
    return this.prismaService.project.create({
      data: {
        name: this.generatePirateShipName(),
        compose_path: data.compose_path,
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
            ... (data.authorization_id ? {
              authorization: {
                connect: { id: data.authorization_id },
              }
            } : {})
          },
        },
      },
    });
  }

  async updateProject(
    projectId: string,
    data: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.prismaService.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        source: true,
      },
    });

    return this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: data.name,
        description: data.description,
        vm: {
          update: {
            cpus: data.cpus,
            memory: data.memory,
          },
        },
        source: {
          update: {
            ...project.source, // Spread the entire 'source' object
            settings: {
              repository: data.repository_branch,
            },
          },
        },
      },
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
