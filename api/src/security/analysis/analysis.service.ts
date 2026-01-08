import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SECURITY_ANALYZERS, SECURITY_RULES } from '../security.tokens';
import { SecurityAnalyzer } from '../types/analyzer.interface';
import { SecurityRule } from '../types/rule.interface';
import { SecurityFinding } from '../types/findings';
import { SecurityFact } from '../types/facts';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalysisService {
  constructor(
    @Inject(SECURITY_ANALYZERS)
    private readonly analyzers: SecurityAnalyzer[],

    @Inject(SECURITY_RULES)
    private readonly rules: SecurityRule[],

    private readonly prismaService: PrismaService,
  ) {
    this.analyzers = Array.isArray(this.analyzers)
      ? this.analyzers
      : [this.analyzers];
    this.rules = Array.isArray(this.rules) ? this.rules : [this.rules];
  }

  async analyzeProject(projectId: string): Promise<SecurityFinding[]> {
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const facts: SecurityFact[] = (
      await Promise.all(this.analyzers.map((a) => a.analyze(project)))
    ).flat();

    const findings: SecurityFinding[] = [];

    for (const fact of facts) {
      for (const rule of this.rules) {
        if (rule.supports(fact)) {
          findings.push(...rule.evaluate(fact));
        }
      }
    }
    return findings;
  }
}
