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

  private readonly SECRET_KEYWORDS = [
    'PASSWORD',
    'TOKEN',
    'API_KEY',
    'SECRET',
    'ACCESS_KEY',
    'PRIVATE_KEY',
    'AUTH_KEY',
    'CLIENT_SECRET',
  ];

  supports(fact: SecurityFact): fact is EnvVarFact {
    return fact.type === 'env-var';
  }

  evaluate(fact: EnvVarFact): SecurityFinding[] {
    const keyUpper = fact.key.toUpperCase();

    const isSecretKey = this.SECRET_KEYWORDS.some((kw) =>
      keyUpper.includes(kw),
    );

    if (!isSecretKey) {
      return [];
    }

    // Ignore env bindings (${VAR}, ${VAR:-default}, etc.)
    const isBoundToEnv = /^\$\{[A-Za-z_]\w*(?:[:\-?].*)?\}$/.test(fact.value);

    if (isBoundToEnv) {
      return [];
    }

    // Basic entropy / length heuristic
    const looksLikeSecret = /[A-Za-z0-9+/=_-]+/.test(fact.value);

    if (!looksLikeSecret) {
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
