import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ProjectRepository } from '../project.repository';
import { SourceType } from 'src/source/dto/create-source.dto';

@Injectable()
export class ZipSourceGuard implements CanActivate {
  constructor(private readonly project: ProjectRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sourceId = request.params?.id;

    if (!sourceId) {
      throw new ForbiddenException('Source ID is required');
    }

    const project = await this.project.findProjectById(sourceId);
    const source = project?.source;

    if (!source) {
      throw new ForbiddenException('Source not found');
    }

    if (source.type !== SourceType.ZIP_UPLOAD) {
      throw new ForbiddenException(
        `Source type must be "zip", got "${source.type}"`,
      );
    }

    return true;
  }
}
