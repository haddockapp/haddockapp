import { Injectable } from '@nestjs/common';
import { AnalysisContext } from 'src/security/types/analysis-context';
import { SecurityAnalyzer } from 'src/security/types/analyzer.interface';
import { SecurityFact } from 'src/security/types/facts';
import { EnvFileFact } from './types';
import { FileEntry } from '../../../helpers/project-file-index.service';

@Injectable()
export class EnvFileAnalyzer implements SecurityAnalyzer {
  async analyze(context: AnalysisContext): Promise<SecurityFact[]> {
    const { project } = context;

    if (!project.path || !context.fileIndex) return [];

    const envPaths = [
      '.env',
      '.env.local',
      '.env.production',
      '.env.development',
      '.env.test',
    ];

    const facts: EnvFileFact[] = [];

    for (const file of envPaths) {
      const file_entry: FileEntry[] | undefined =
        context.fileIndex.files.get(file);

      if (!file_entry) continue;

      for (const entry of file_entry) {
        facts.push({
          type: 'env-file',
          source: 'env-file',
          file: entry.relativePath,
        });
      }
    }

    return facts;
  }
}
