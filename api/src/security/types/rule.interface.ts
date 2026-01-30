import { SecurityFact } from './facts';
import { SecurityFinding } from './findings';

export interface SecurityRule<T extends SecurityFact = SecurityFact> {
  supports(fact: SecurityFact): fact is T;
  evaluate(fact: T): Promise<SecurityFinding[]>;
}
