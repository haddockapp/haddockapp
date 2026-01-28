import { Injectable } from '@nestjs/common';
import { AnalysisContext } from 'src/security/types/analysis-context';
import { SecurityAnalyzer } from 'src/security/types/analyzer.interface';
import { SecurityFact } from 'src/security/types/facts';
import { execCommand } from '../../../../utils/exec-utils';
import { TrivyConfigFact, TrivyConfigOutput } from './types';

@Injectable()
export class TrivyConfigAnalyzer implements SecurityAnalyzer {
  async analyze(context: AnalysisContext): Promise<SecurityFact[]> {
    const { project } = context;

    if (!project.path) return [];

    const { stdout } = await execCommand(
      `trivy config --format json ${project.path}`,
    );

    const trivyOutput = JSON.parse(stdout) as TrivyConfigOutput;

    const facts: TrivyConfigFact[] = [];

    for (const result of trivyOutput.Results) {
      for (const misconfiguration of result.Misconfigurations) {
        facts.push({
          type: 'trivy-config',
          source: 'trivy-config',
          target: result.Target,
          misconfiguration,
        });
      }
    }
    return facts;
  }
}
