import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TemplatesMapper } from './templates.mapper';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplatesMapper],
})
export class TemplatesModule {}
