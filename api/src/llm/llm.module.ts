import { Module } from '@nestjs/common';
import { DomainsModule } from '../domains/domains.module';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

@Module({
  imports: [DomainsModule],
  controllers: [LlmController],
  providers: [LlmService],
})
export class LlmModule {}
