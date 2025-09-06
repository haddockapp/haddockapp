import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectService } from '../project/project.service';
import { ProjectRepository } from '../project/project.repository';
import { EnvironmentVar } from '../project/dto/environmentVar';
import { ServiceActionDto } from '../project/dto/serviceAction.dto';
import ProjectServiceDto from '../project/dto/ProjectService.dto';
import { TokenUser } from '../auth/guard/token.guard';

@Injectable()
export class CliService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectRepository: ProjectRepository,
  ) {}

  /**
   * Get project information for CLI access
   */
  async getProject(user: TokenUser) {
    return await this.projectRepository.findProjectById(user.projectId);
  }

  /**
   * Start a project via CLI
   */
  async startProject(user: TokenUser) {
    await this.projectService.startProject(user.projectId);
    return { 
      message: 'Project started successfully', 
      projectId: user.projectId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Stop a project via CLI
   */
  async stopProject(user: TokenUser) {
    await this.projectService.stopProject(user.projectId);
    return { 
      message: 'Project stopped successfully', 
      projectId: user.projectId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Deploy a project via CLI
   */
  async deployProject(user: TokenUser) {
    await this.projectService.deployProject(user.projectId);
    return { 
      message: 'Project deployment started', 
      projectId: user.projectId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Recreate a project via CLI
   */
  async recreateProject(user: TokenUser) {
    await this.projectService.recreateProject(user.projectId);
    return { 
      message: 'Project recreation started', 
      projectId: user.projectId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get all services for a project
   */
  async getProjectServices(user: TokenUser): Promise<ProjectServiceDto[]> {
    const project = await this.projectRepository.findProjectById(user.projectId);
    
    return await Promise.all(
      project.services.map(async (service) => {
        return this.projectService.serviceEntityToDto(service);
      }),
    );
  }

  /**
   * Get a specific service by ID
   */
  async getProjectService(serviceId: string, user: TokenUser): Promise<ProjectServiceDto> {
    const project = await this.projectRepository.findProjectById(user.projectId);
    
    const service = project.services.find(
      (service) => service.id === serviceId,
    );
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }
    
    return this.projectService.serviceEntityToDto(service);
  }

  /**
   * Perform a service action (start, stop, restart, etc.)
   */
  async manageService(data: ServiceActionDto, user: TokenUser) {
    const result = await this.projectService.serviceAction(user.projectId, data);
    return { 
      message: `Service ${data.action} action initiated successfully`, 
      projectId: user.projectId,
      serviceId: data.service,
      action: data.action,
      timestamp: new Date().toISOString(),
      result 
    };
  }

  /**
   * Get environment variables for a project
   */
  async getEnvironmentVars(user: TokenUser): Promise<EnvironmentVar[]> {
    return await this.projectService.getEnvironmentVars(user.projectId);
  }

  /**
   * Create a new environment variable
   */
  async createEnvironmentVar(data: EnvironmentVar, user: TokenUser) {
    const result = await this.projectService.createEnvironment(user.projectId, data);
    return { 
      message: 'Environment variable created successfully', 
      projectId: user.projectId,
      variable: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update an existing environment variable
   */
  async updateEnvironmentVar(key: string, data: EnvironmentVar, user: TokenUser) {
    const result = await this.projectService.updateEnvironment(user.projectId, key, data);
    return { 
      message: 'Environment variable updated successfully', 
      projectId: user.projectId,
      key,
      variable: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Delete an environment variable
   */
  async deleteEnvironmentVar(key: string, user: TokenUser) {
    await this.projectService.deleteEnvironment(user.projectId, key);
    return { 
      message: 'Environment variable deleted successfully', 
      projectId: user.projectId,
      key,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check specifically for CLI access
   */
  async healthCheck(user: TokenUser) {
    return {
      status: 'ok',
      message: 'CLI API is operational',
      projectId: user.projectId,
      permissions: user.permissions,
      timestamp: new Date().toISOString(),
    };
  }
}
