import { SecurityCategory } from './categories';
import { SecurityFact } from './facts';
import { SecurityFinding, Severity } from './findings';

export interface SecurityRule<T extends SecurityFact = SecurityFact> {
  readonly definition: {
    id: string;
    severity: Severity;
    category: SecurityCategory;
    title: string;
    description: string;
    recommendation: string;
  };

  supports(fact: SecurityFact): fact is T;
  evaluate(fact: T): SecurityFinding[];
}
