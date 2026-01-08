import { Controller, Get, Param } from '@nestjs/common';
import { AnalysisService } from './analysis/analysis.service';
import { SecurityFinding } from './types/findings';

@Controller('security')
export class SecurityController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('analyze/:projectId')
  async analyze(
    @Param('projectId') projectId: string,
  ): Promise<SecurityFinding[]> {
    const findings = await this.analysisService.analyzeProject(projectId);
    return findings;
  }
}
