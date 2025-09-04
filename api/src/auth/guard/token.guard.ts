import { Injectable, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSION_KEY } from '../decorator/require-permission.decorator';
import { ProjectTokenService } from '../../project/project-token.service';

export interface TokenUser {
  projectId: string;
  permissions: string[];
}

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly projectTokenService: ProjectTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const tokenMatch = authHeader.match(/^Token\s+(.+)$/i);
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid authorization format. Use: Authorization: Token <token>');
    }

    const token = tokenMatch[1];
    
    const tokenData = await this.projectTokenService.findProjectByToken(token);
    
    if (!tokenData) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user: TokenUser = {
      projectId: tokenData.projectId,
      permissions: tokenData.permissions,
    };

    request.user = user;

    const requiredPermission = this.reflector.get<string>(
      REQUIRED_PERMISSION_KEY,
      context.getHandler(),
    );

    if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
      throw new ForbiddenException(`Missing required permission: ${requiredPermission}`);
    }

    return true;
  }
}
