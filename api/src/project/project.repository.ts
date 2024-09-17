import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { Project } from '@prisma/client';
import { UpdateProjectDto } from './dto/UpdateProject.dto';
import { PersistedProjectDto } from './dto/project.dto';
import { VmProvider } from '../types/vm.enum';

@Injectable()
export class ProjectRepository {
  constructor(private prismaService: PrismaService) {}

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

  async createProject(
    data: CreateProjectDto,
    authorizationId: string,
  ): Promise<Project> {
    return this.prismaService.project.create({
      data: {
        vm: {
          create: {
            name: `${data.repository_organisation}_${data.repository_name}_${data.repository_branch}`,
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
              composeName: data.compose_name,
            },
            authorization: {
              connect: { id: authorizationId },
            },
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
