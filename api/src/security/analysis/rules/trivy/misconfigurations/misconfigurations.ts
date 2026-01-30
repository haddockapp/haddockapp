import { Injectable } from '@nestjs/common';
import { SecurityFact } from 'src/security/types/facts';
import { SecurityFinding } from 'src/security/types/findings';
import { SecurityRule } from 'src/security/types/rule.interface';
import { TrivyConfigFact } from '../../../analyzers/trivy/types';
import { stringToSeverity } from '../severity.utils';

@Injectable()
export class MisconfigurationsRule implements SecurityRule<TrivyConfigFact> {

  supports(fact: SecurityFact): fact is TrivyConfigFact {
    return fact.type === 'trivy-config';
  }

  async evaluate(fact: TrivyConfigFact): Promise<SecurityFinding[]> {
    const results: SecurityFinding[] = [];

    results.push({
      severity: stringToSeverity(fact.misconfiguration.Severity),
      title: fact.misconfiguration.Title,
      category: 'misconfigurations',
      description: fact.misconfiguration.Description,
      recommendation: fact.misconfiguration.Resolution,
      source: fact.source,
      location: JSON.stringify({
        file: fact.target,
      }),
    });

    return results;
  }
}