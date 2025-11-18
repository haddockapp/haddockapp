import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SourceRepository } from '../source.repository';
import { SourceType } from '../dto/create-source.dto';

@Injectable()
export class ZipSourceGuard implements CanActivate {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sourceId = request.params?.id;

    if (!sourceId) {
      throw new ForbiddenException('Source ID is required');
    }

    const source = await this.sourceRepository.findById(sourceId);

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
