import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SECURITY_ANALYZERS, SECURITY_RULES } from '../security.tokens';
import { SecurityAnalyzer } from '../types/analyzer.interface';
import { SecurityRule } from '../types/rule.interface';
import { SecurityFinding } from '../types/findings';
import { SecurityFact } from '../types/facts';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectFileIndexService } from '../helpers/project-file-index.service';
import { AnalysisContext } from '../types/analysis-context';
import * as path from 'node:path';

@Injectable()
export class AnalysisService {
  constructor(
    @Inject(SECURITY_ANALYZERS)
    private readonly analyzers: SecurityAnalyzer[],

    @Inject(SECURITY_RULES)
    private readonly rules: SecurityRule[],

    private readonly fileIndexService: ProjectFileIndexService,

    private readonly prismaService: PrismaService,
  ) {}

  async analyzeProject(projectId: string): Promise<SecurityFinding[]> {
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const projectPath: string | null =
      project.path === undefined ? null : path.resolve(project.path);

    const context: AnalysisContext = {
      project,
      fileIndex: projectPath
        ? await this.fileIndexService.build(projectPath)
        : null,
    };

    const facts: SecurityFact[] = (
      await Promise.all(
        this.analyzers.map(async (a) => {
          try {
            return await a.analyze(context);
          } catch (error) {
            console.error('Error running analyzer', error);
            return [];
          }
        }),
      )
    ).flat();

    const findings: SecurityFinding[] = [];

    for (const fact of facts) {
      for (const rule of this.rules) {
        try {
          if (rule.supports(fact)) {
            const ruleFindings = await rule.evaluate(fact);
            findings.push(...ruleFindings);
          }
        } catch (error) {
          console.error('Error evaluating rule', error);
        }
      }
    }
    return findings;
  }
}
