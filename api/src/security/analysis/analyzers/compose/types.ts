import { SecurityFact } from 'src/security/types/facts';

export interface EnvVarFact extends SecurityFact {
  type: 'env-var';
  service: string;
  key: string;
  value: string;
  file: string;
}
export interface ImageFact extends SecurityFact {
  type: 'docker-image';
  service: string;
  image: string;
  file: string;
}
