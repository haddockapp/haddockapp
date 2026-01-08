import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { SecurityFact } from './facts';

export interface SecurityAnalyzer {
  analyze(project: PersistedProjectDto): Promise<SecurityFact[]>;
}
