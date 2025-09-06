import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspacesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createWorkspace(name: string) {
    return await this.prismaService.workspace.create({
      data: { name },
    });
  }

  async findAllWorkspaces() {
    return await this.prismaService.workspace.findMany();
  }

  async deleteWorkspace(id: string) {
    await this.prismaService.workspace.delete({
      where: { id },
    });
  }
}
