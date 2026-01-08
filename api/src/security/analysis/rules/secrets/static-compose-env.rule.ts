import { Injectable } from '@nestjs/common';
import { SecurityRule } from 'src/security/types/rule.interface';
import { EnvVarFact } from '../../analyzers/compose/types';
import { SecurityFact } from 'src/security/types/facts';
import { SecurityFinding, SeverityLevel } from 'src/security/types/findings';
import { SecurityCategories } from 'src/security/types/categories';

@Injectable()
export class StaticComposeEnvRule implements SecurityRule<EnvVarFact> {
  readonly definition = {
    id: 'secrets/compose/static-env',
    severity: SeverityLevel.HIGH,
    category: SecurityCategories.SECRETS,
    title: 'Static secret in compose environment',
    description:
      'A password-like environment variable is statically defined in docker-compose.yml.',
    recommendation:
      'Bind secrets to environment variables or use a secret manager.',
  };

  supports(fact: SecurityFact): fact is EnvVarFact {
    return fact.type === 'env-var';
  }

  evaluate(fact: EnvVarFact): SecurityFinding[] {
    const isPassword = fact.key.toUpperCase().includes('PASSWORD');

    const isBoundToEnv = /^\$\{[A-Za-z_]\w*.*\}$/.test(fact.value);

    if (!isPassword || isBoundToEnv) {
      return [];
    }

    return [
      {
        severity: this.definition.severity,
        category: this.definition.category,
        title: this.definition.title,
        description: `${this.definition.description}
Service "${fact.service}" defines "${fact.key}" statically.`,
        recommendation: this.definition.recommendation,
        source: fact.source,
        location: JSON.stringify({
          file: fact.file,
          key: fact.key,
        }),
        metadata: JSON.stringify({
          key: fact.key,
          service: fact.service,
        }),
      },
    ];
  }
}
