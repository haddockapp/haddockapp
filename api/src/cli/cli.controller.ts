import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TokenAuthGuard, TokenUser } from '../auth/guard/token.guard';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { TokenPermission } from '../project/types/token-permissions.enum';
import { EnvironmentVar } from '../project/dto/environmentVar';
import { ServiceActionDto } from '../project/dto/serviceAction.dto';
import ProjectServiceDto from '../project/dto/ProjectService.dto';
import { CurrentUser } from 'src/auth/user.context';
import { CliService } from './cli.service';

@Controller('cli')
@UseGuards(TokenAuthGuard)
export class CliController {
  constructor(
    private readonly cliService: CliService,
  ) {}

  // Project information endpoints
  @Get('project')
  @RequirePermission([TokenPermission.READ])
  async getProject(@CurrentUser() user: TokenUser) {
    return await this.cliService.getProject(user);
  }

  // Project control endpoints
  @Post('project/start')
  @RequirePermission([TokenPermission.START])
  async startProject(@CurrentUser() user: TokenUser) {
    return await this.cliService.startProject(user);
  }

  @Post('project/stop')
  @RequirePermission([TokenPermission.STOP])
  async stopProject(@CurrentUser() user: TokenUser) {
    return await this.cliService.stopProject(user);
  }

  @Post('project/deploy')
  @RequirePermission([TokenPermission.DEPLOY])
  async deployProject(@CurrentUser() user: TokenUser) {
    return await this.cliService.deployProject(user);
  }

  @Post('project/recreate')
  @RequirePermission([TokenPermission.RECREATE])
  async recreateProject(@CurrentUser() user: TokenUser) {
    return await this.cliService.recreateProject(user);
  }

  // Service management endpoints
  @Get('project/services')
  @RequirePermission([TokenPermission.READ])
  async getProjectServices(@CurrentUser() user: TokenUser): Promise<ProjectServiceDto[]> {
    return await this.cliService.getProjectServices(user);
  }

  @Get('project/services/:serviceId')
  @RequirePermission([TokenPermission.READ])
  async getProjectService(
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: TokenUser
  ): Promise<ProjectServiceDto> {
    return await this.cliService.getProjectService(serviceId, user);
  }

  @Post('project/services')
  @RequirePermission([TokenPermission.MANAGE_SERVICES])
  async manageService(
    @Body() data: ServiceActionDto,
    @CurrentUser() user: TokenUser
  ) {
    return await this.cliService.manageService(data, user);
  }

  // Environment variable endpoints
  @Get('project/environment')
  @RequirePermission([TokenPermission.READ])
  async getEnvironmentVars(@CurrentUser() user: TokenUser): Promise<EnvironmentVar[]> {
    return await this.cliService.getEnvironmentVars(user);
  }

  @Post('project/environment')
  @RequirePermission([TokenPermission.MANAGE_ENVIRONMENT])
  async createEnvironment(
    @Body() data: EnvironmentVar,
    @CurrentUser() user: TokenUser
  ) {
    return await this.cliService.createEnvironmentVar(data, user);
  }

  @Patch('project/environment/:key')
  @RequirePermission([TokenPermission.MANAGE_ENVIRONMENT])
  async updateEnvironment(
    @Param('key') key: string,
    @Body() data: EnvironmentVar,
    @CurrentUser() user: TokenUser
  ) {
    return await this.cliService.updateEnvironmentVar(key, data, user);
  }

  @Delete('project/environment/:key')
  @RequirePermission([TokenPermission.MANAGE_ENVIRONMENT])
  async deleteEnvironment(
    @Param('key') key: string,
    @CurrentUser() user: TokenUser
  ) {
    return await this.cliService.deleteEnvironmentVar(key, user);
  }

  // Health check endpoint for CLI
  @Get('health')
  async healthCheck(@CurrentUser() user: TokenUser) {
    return await this.cliService.healthCheck(user);
  }
}
