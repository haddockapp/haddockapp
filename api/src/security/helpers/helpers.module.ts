import { Module } from '@nestjs/common';
import { ProjectFileIndexService } from './project-file-index.service';

@Module({
  providers: [ProjectFileIndexService],
  exports: [ProjectFileIndexService],
})
export class SecurityHelpersModule {}
