import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ComposeService } from 'src/compose/compose.service';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import {
  SecurityAdviceDto,
  SecurityAdviceType,
} from 'src/project/dto/securityAdvice.dto';
import { GithubSourceSettingsDto } from 'src/source/dto/settings.dto';
import { SourceService } from 'src/source/source.service';
import { getSettings } from 'src/source/utils/get-settings';

@Injectable()
export class SecurityAdvicesService {
  constructor(
    private readonly composeService: ComposeService,
    private readonly sourceService: SourceService,
  ) {}

  async getComposeAdvices(
    project: PersistedProjectDto,
  ): Promise<SecurityAdviceDto[]> {
    const source = await this.sourceService.findSourceById(project.sourceId);
    if (!source) throw new Error('Source not found');

    if (source.type !== 'github')
      throw new BadRequestException('Source type must be github');

    const settings = getSettings<GithubSourceSettingsDto>(source.settings);
    const composePath = `./${process.env.SOURCE_DIR}/${settings.composePath}`;

    const rawCompose = await this.composeService.readComposeFile(
      project.id,
      composePath,
    );
    if (!rawCompose) throw new NotFoundException('Compose file not found');

    const services = this.composeService.parseServices(rawCompose.toString());

    const advices: SecurityAdviceDto[] = [];

    for (const service of services) {
      if (!service.environment || typeof service.environment !== 'object')
        continue;

      for (const [key, value] of Object.entries(service.environment)) {
        // Password should be binded to an environment variable
        if (
          key.includes('PASSWORD') &&
          !/^\$[A-Za-z_][A-Za-z0-9_]*$/.test(value)
        ) {
          advices.push({
            type: SecurityAdviceType.EXPOSED_ENV,
            data: {
              service: service.name,
              variable: key,
            },
          });
        }
      }
    }

    return advices;
  }

  // add more checks here...
}
