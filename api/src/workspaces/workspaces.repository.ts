import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createWorkspace({ name, description }: CreateWorkspaceDto) {
    return await this.prismaService.workspace.create({
      data: { name, description },
    });
  }

  async findAllWorkspaces() {
    return await this.prismaService.workspace.findMany({
      include: { _count: { select: { projects: true } } },
    });
  }

  async deleteWorkspace(id: string) {
    await this.prismaService.workspace.delete({
      where: { id },
    });
  }
}
