import { Injectable } from '@nestjs/common';
import { ComposeService } from 'src/compose/compose.service';
import { ServiceDto } from 'src/compose/model/Service';
import { SecurityAnalyzer } from 'src/security/types/analyzer.interface';
import { SecurityFact } from 'src/security/types/facts';
import { SourceService } from 'src/source/source.service';
import { EnvVarFact } from './types';
import { AnalysisContext } from 'src/security/types/analysis-context';

@Injectable()
export class ComposeAnalyzer implements SecurityAnalyzer {
  constructor(
    private readonly sourceService: SourceService,
    private readonly composeService: ComposeService,
  ) {}

  async analyze(context: AnalysisContext): Promise<SecurityFact[]> {
    const source = await this.sourceService.findSourceById(
      context.project.sourceId,
    );

    if (!source) {
      return [];
    }

    const composePath = this.sourceService.getComposePath(source);

    const rawCompose = this.composeService.readComposeFile(
      context.project.id,
      composePath,
    );
    if (!rawCompose) {
      return [];
    }

    const services = this.composeService.parseServices(rawCompose.toString());

    return this.extractEnvVarFacts(services, composePath);
  }

  private extractEnvVarFacts(
    services: ServiceDto[],
    composePath: string,
  ): EnvVarFact[] {
    const facts: EnvVarFact[] = [];

    for (const service of services) {
      if (!service.environment || typeof service.environment !== 'object') {
        continue;
      }

      for (const [key, value] of Object.entries(service.environment)) {
        facts.push({
          type: 'env-var',
          source: 'docker-compose',
          service: service.name,
          key,
          value: String(value),
          file: composePath,
        });
      }
    }

    return facts;
  }
}
