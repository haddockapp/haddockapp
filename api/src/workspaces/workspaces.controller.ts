import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  async findAll() {
    return this.workspacesService.findAll();
  }

  @Post()
  async createNewWorkspace(@Body() body: CreateWorkspaceDto) {
    return this.workspacesService.createNewWorkspace(body);
  }

  @Delete(':id')
  async deleteWorkspace(@Param('id') id: string) {
    this.workspacesService.deleteWorkspace(id);
  }
}
