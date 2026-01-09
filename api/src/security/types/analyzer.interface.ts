import { SecurityFact } from './facts';
import { AnalysisContext } from './analysis-context';

export interface SecurityAnalyzer {
  analyze(context: AnalysisContext): Promise<SecurityFact[]>;
}
