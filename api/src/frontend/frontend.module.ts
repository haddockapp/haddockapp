import { Module } from '@nestjs/common';
import { FrontendService } from './frontend.service';

@Module({
  imports: [],
  providers: [FrontendService],
  exports: [FrontendService],
})
export class FrontendModule {}
