import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectTokenDto } from './dto/CreateProjectToken.dto';
import { UpdateProjectTokenDto } from './dto/UpdateProjectToken.dto';
import { ProjectTokenResponse } from './dto/ProjectToken.response';
import { TokenPermission, ALL_PERMISSIONS } from './types/token-permissions.enum';
import * as crypto from 'crypto';

@Injectable()
export class ProjectTokenService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSecureToken(): string {
    // Generate a secure random token
    const prefix = 'hdk_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  private validatePermissions(permissions: string[]): void {
    const invalidPermissions = permissions.filter(
      permission => !ALL_PERMISSIONS.includes(permission as TokenPermission)
    );
    
    if (invalidPermissions.length > 0) {
      throw new BadRequestException(
        `Invalid permissions: ${invalidPermissions.join(', ')}. Valid permissions are: ${ALL_PERMISSIONS.join(', ')}`
      );
    }
  }

  async createToken(projectId: string, data: CreateProjectTokenDto): Promise<ProjectTokenResponse> {
    // Validate permissions
    this.validatePermissions(data.permissions);

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Generate secure token
    const token = this.generateSecureToken();

    const projectToken = await this.prisma.projectToken.create({
      data: {
        name: data.name,
        token,
        permissions: data.permissions,
        projectId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return {
      ...projectToken,
      token, // Include the token only when creating
    };
  }

  async findTokensByProject(projectId: string): Promise<ProjectTokenResponse[]> {
    const tokens = await this.prisma.projectToken.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // Don't include the actual token value in list responses
    return tokens.map(token => ({
      ...token,
      token: undefined,
    }));
  }

  async findTokenById(projectId: string, tokenId: string): Promise<ProjectTokenResponse> {
    const token = await this.prisma.projectToken.findFirst({
      where: { 
        id: tokenId,
        projectId 
      },
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return {
      ...token,
      token: undefined, // Don't expose the actual token
    };
  }

  async updateToken(projectId: string, tokenId: string, data: UpdateProjectTokenDto): Promise<ProjectTokenResponse> {
    // Validate permissions if provided
    if (data.permissions) {
      this.validatePermissions(data.permissions);
    }

    const existingToken = await this.prisma.projectToken.findFirst({
      where: { 
        id: tokenId,
        projectId 
      },
    });

    if (!existingToken) {
      throw new NotFoundException('Token not found');
    }

    const updatedToken = await this.prisma.projectToken.update({
      where: { id: tokenId },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return {
      ...updatedToken,
      token: undefined,
    };
  }

  async deleteToken(projectId: string, tokenId: string): Promise<void> {
    const existingToken = await this.prisma.projectToken.findFirst({
      where: { 
        id: tokenId,
        projectId 
      },
    });

    if (!existingToken) {
      throw new NotFoundException('Token not found');
    }

    await this.prisma.projectToken.delete({
      where: { id: tokenId },
    });
  }

  async validateTokenForProject(token: string, projectId: string, requiredPermission?: string): Promise<boolean> {
    const projectToken = await this.prisma.projectToken.findFirst({
      where: { 
        token,
        projectId,
        isActive: true,
      },
    });

    if (!projectToken) {
      return false;
    }

    // Check if token is expired
    if (projectToken.expiresAt && projectToken.expiresAt < new Date()) {
      return false;
    }

    // Check if specific permission is required
    if (requiredPermission && !projectToken.permissions.includes(requiredPermission)) {
      return false;
    }

    // Update last used timestamp
    await this.prisma.projectToken.update({
      where: { id: projectToken.id },
      data: { lastUsedAt: new Date() },
    });

    return true;
  }

  async findProjectByToken(token: string): Promise<{ projectId: string, permissions: string[] } | null> {
    const projectToken = await this.prisma.projectToken.findFirst({
      where: { 
        token,
        isActive: true,
      },
      include: {
        project: true,
      },
    });

    if (!projectToken) {
      return null;
    }

    // Check if token is expired
    if (projectToken.expiresAt && projectToken.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp
    await this.prisma.projectToken.update({
      where: { id: projectToken.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      projectId: projectToken.projectId,
      permissions: projectToken.permissions,
    };
  }
}
