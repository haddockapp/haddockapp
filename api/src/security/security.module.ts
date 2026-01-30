import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalysisService } from './analysis/analysis.service';
import { SecurityController } from './security.controller';
import { analyzerProviders } from './analysis/analyzers';
import { ruleProviders } from './analysis/rules';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SourceModule } from 'src/source/source.module';
import { ComposeModule } from 'src/compose/compose.module';
import { SecurityHelpersModule } from './helpers/helpers.module';

@Module({
  controllers: [SecurityController],
  providers: [AnalysisService, ...analyzerProviders, ...ruleProviders],
  imports: [
    CacheModule.register(),
    PrismaModule,
    SourceModule,
    ComposeModule,
    SecurityHelpersModule,
  ],
  exports: [AnalysisService],
})
export class SecurityModule {}
