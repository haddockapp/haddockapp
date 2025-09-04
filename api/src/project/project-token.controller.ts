import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectTokenService } from './project-token.service';
import { CreateProjectTokenDto } from './dto/CreateProjectToken.dto';
import { UpdateProjectTokenDto } from './dto/UpdateProjectToken.dto';
import { ProjectTokenResponse } from './dto/ProjectToken.response';

@Controller('project/:projectId/tokens')
export class ProjectTokenController {
  constructor(private readonly projectTokenService: ProjectTokenService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createToken(
    @Param('projectId') projectId: string,
    @Body() createTokenDto: CreateProjectTokenDto,
  ): Promise<ProjectTokenResponse> {
    return this.projectTokenService.createToken(projectId, createTokenDto);
  }

  @Get()
  async getTokens(
    @Param('projectId') projectId: string,
  ): Promise<ProjectTokenResponse[]> {
    return this.projectTokenService.findTokensByProject(projectId);
  }

  @Get(':tokenId')
  async getToken(
    @Param('projectId') projectId: string,
    @Param('tokenId') tokenId: string,
  ): Promise<ProjectTokenResponse> {
    return this.projectTokenService.findTokenById(projectId, tokenId);
  }

  @Patch(':tokenId')
  async updateToken(
    @Param('projectId') projectId: string,
    @Param('tokenId') tokenId: string,
    @Body() updateTokenDto: UpdateProjectTokenDto,
  ): Promise<ProjectTokenResponse> {
    return this.projectTokenService.updateToken(projectId, tokenId, updateTokenDto);
  }

  @Delete(':tokenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteToken(
    @Param('projectId') projectId: string,
    @Param('tokenId') tokenId: string,
  ): Promise<void> {
    return this.projectTokenService.deleteToken(projectId, tokenId);
  }
}
