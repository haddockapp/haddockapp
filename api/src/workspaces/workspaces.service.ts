import { BadRequestException, Injectable } from '@nestjs/common';
import { Workspace } from '@prisma/client';
import { CreateWorkspaceDto } from 'src/workspaces/dto/create-workspace.dto';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';

@Injectable()
export class WorkspacesService {
  constructor(private readonly workspacesRepository: WorkspacesRepository) {}

  async findAll(): Promise<Workspace[]> {
    return await this.workspacesRepository.findAllWorkspaces();
  }

  async createNewWorkspace({ name }: CreateWorkspaceDto): Promise<Workspace> {
    try {
      return await this.workspacesRepository.createWorkspace(name);
    } catch (error) {
      throw new BadRequestException('Workspace already exists');
    }
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.workspacesRepository.deleteWorkspace(id);
  }
}
