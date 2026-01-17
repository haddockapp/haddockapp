import { Injectable } from '@nestjs/common';
import { SecurityRule } from 'src/security/types/rule.interface';
import { SecurityFact } from 'src/security/types/facts';
import { SecurityFinding, SeverityLevel } from 'src/security/types/findings';
import { SecurityCategories } from 'src/security/types/categories';
import { EnvFileFact } from '../../analyzers/files/types';

@Injectable()
export class EnvFileRule implements SecurityRule<EnvFileFact> {
  readonly definition = {
    id: 'files/env',
    severity: SeverityLevel.HIGH,
    category: SecurityCategories.SECRETS,
    title: 'Environment file found',
    description: 'An environment file is found in the project.',
    recommendation:
      'Review the contents of the environment file and ensure no sensitive information is exposed.',
  };

  supports(fact: SecurityFact): fact is EnvFileFact {
    return fact.type === 'env-file';
  }

  async evaluate(fact: EnvFileFact): Promise<SecurityFinding[]> {
    return [
      {
        severity: this.definition.severity,
        category: this.definition.category,
        title: this.definition.title,
        description: `${this.definition.description}
File "${fact.file}" is found.`,
        recommendation: this.definition.recommendation,
        source: fact.source,
        location: JSON.stringify({
          file: fact.file,
        }),
      },
    ];
  }
}
