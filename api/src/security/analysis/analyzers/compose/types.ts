import { SecurityFact } from 'src/security/types/facts';

export interface EnvVarFact extends SecurityFact {
  type: 'env-var';
  service: string;
  key: string;
  value: string;
  file: string;
}
