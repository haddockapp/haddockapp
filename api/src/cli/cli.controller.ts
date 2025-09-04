import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectService } from '../project/project.service';
import { ProjectRepository } from '../project/project.repository';
import { TokenAuthGuard, TokenUser } from '../auth/guard/token.guard';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { TokenPermission } from '../project/types/token-permissions.enum';
import { EnvironmentVar } from '../project/dto/environmentVar';
import { ServiceActionDto } from '../project/dto/serviceAction.dto';
import ProjectServiceDto from '../project/dto/ProjectService.dto';

@Controller('cli')
@UseGuards(TokenAuthGuard)
export class CliController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectRepository: ProjectRepository,
  ) {}

  // Project information endpoints
  @Get('project')
  @RequirePermission(TokenPermission.READ)
  async getProject(@Request() req: any) {
    const user = req.user as TokenUser;
    return await this.projectRepository.findProjectById(user.projectId);
  }

  // Project control endpoints
  @Post('project/start')
  @RequirePermission(TokenPermission.START)
  async startProject(@Request() req: any) {
    const user = req.user as TokenUser;
    await this.projectService.startProject(user.projectId);
    return { message: 'Project started successfully', projectId: user.projectId };
  }

  @Post('project/stop')
  @RequirePermission(TokenPermission.STOP)
  async stopProject(@Request() req: any) {
    const user = req.user as TokenUser;
    await this.projectService.stopProject(user.projectId);
    return { message: 'Project stopped successfully', projectId: user.projectId };
  }

  @Post('project/deploy')
  @RequirePermission(TokenPermission.DEPLOY)
  async deployProject(@Request() req: any) {
    const user = req.user as TokenUser;
    await this.projectService.deployProject(user.projectId);
    return { message: 'Project deployment started', projectId: user.projectId };
  }

  @Post('project/recreate')
  @RequirePermission(TokenPermission.RECREATE)
  async recreateProject(@Request() req: any) {
    const user = req.user as TokenUser;
    await this.projectService.recreateProject(user.projectId);
    return { message: 'Project recreation started', projectId: user.projectId };
  }

  // Service management endpoints
  @Get('project/services')
  @RequirePermission(TokenPermission.READ)
  async getProjectServices(@Request() req: any): Promise<ProjectServiceDto[]> {
    const user = req.user as TokenUser;
    const project = await this.projectRepository.findProjectById(user.projectId);
    
    return await Promise.all(
      project.services.map(async (service) => {
        return this.projectService.serviceEntityToDto(service);
      }),
    );
  }

  @Get('project/services/:serviceId')
  @RequirePermission(TokenPermission.READ)
  async getProjectService(
    @Param('serviceId') serviceId: string,
    @Request() req: any,
  ): Promise<ProjectServiceDto> {
    const user = req.user as TokenUser;
    const project = await this.projectRepository.findProjectById(user.projectId);
    
    const service = project.services.find(
      (service) => service.id === serviceId,
    );
    
    if (!service) {
      throw new Error('Service not found');
    }
    
    return this.projectService.serviceEntityToDto(service);
  }

  @Post('project/services')
  @RequirePermission(TokenPermission.MANAGE_SERVICES)
  async manageService(
    @Body() data: ServiceActionDto,
    @Request() req: any,
  ) {
    const user = req.user as TokenUser;
    const result = await this.projectService.serviceAction(user.projectId, data);
    return { 
      message: `Service ${data.action} action initiated successfully`, 
      projectId: user.projectId,
      serviceId: data.service,
      action: data.action,
      result 
    };
  }

  // Environment variable endpoints
  @Get('project/environment')
  @RequirePermission(TokenPermission.READ)
  async getEnvironmentVars(@Request() req: any): Promise<EnvironmentVar[]> {
    const user = req.user as TokenUser;
    return await this.projectService.getEnvironmentVars(user.projectId);
  }

  @Post('project/environment')
  @RequirePermission(TokenPermission.MANAGE_ENVIRONMENT)
  async createEnvironment(
    @Body() data: EnvironmentVar,
    @Request() req: any,
  ) {
    const user = req.user as TokenUser;
    const result = await this.projectService.createEnvironment(user.projectId, data);
    return { 
      message: 'Environment variable created successfully', 
      projectId: user.projectId,
      variable: result 
    };
  }

  @Patch('project/environment/:key')
  @RequirePermission(TokenPermission.MANAGE_ENVIRONMENT)
  async updateEnvironment(
    @Param('key') key: string,
    @Body() data: EnvironmentVar,
    @Request() req: any,
  ) {
    const user = req.user as TokenUser;
    const result = await this.projectService.updateEnvironment(user.projectId, key, data);
    return { 
      message: 'Environment variable updated successfully', 
      projectId: user.projectId,
      key,
      variable: result 
    };
  }

  @Delete('project/environment/:key')
  @RequirePermission(TokenPermission.MANAGE_ENVIRONMENT)
  async deleteEnvironment(
    @Param('key') key: string,
    @Request() req: any,
  ) {
    const user = req.user as TokenUser;
    await this.projectService.deleteEnvironment(user.projectId, key);
    return { 
      message: 'Environment variable deleted successfully', 
      projectId: user.projectId,
      key 
    };
  }

  // Health check endpoint for CLI
  @Get('health')
  async healthCheck(@Request() req: any) {
    const user = req.user as TokenUser;
    return {
      status: 'ok',
      message: 'CLI API is operational',
      projectId: user.projectId,
      permissions: user.permissions,
      timestamp: new Date().toISOString(),
    };
  }
}
