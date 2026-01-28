import { SecurityFact } from 'src/security/types/facts';

export interface EnvFileFact extends SecurityFact {
  type: 'env-file';
  file: string;
}
