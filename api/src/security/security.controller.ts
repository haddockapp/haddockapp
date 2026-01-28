import { Controller, Get, Param, Inject, Post } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AnalysisService } from './analysis/analysis.service';
import { SecurityFinding } from './types/findings';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly analysisService: AnalysisService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  @Post('analyze/:projectId')
  async analyze(
    @Param('projectId') projectId: string,
  ): Promise<{ success: boolean }> {
    const cacheKey = `security:findings:${projectId}`;
    const findings = await this.analysisService.analyzeProject(projectId);
    await this.cache.set(cacheKey, findings);
    return { success: true };
  }

  @Get('findings/:projectId')
  async getFindings(
    @Param('projectId') projectId: string,
  ): Promise<{ findings: SecurityFinding[] }> {
    const cacheKey = `security:findings:${projectId}`;
    let findings = await this.cache.get<SecurityFinding[]>(cacheKey);
    if (!findings) {
      findings = await this.analysisService.analyzeProject(projectId);
      await this.cache.set(cacheKey, findings);
    }
    return { findings: findings ?? [] };
  }
}
