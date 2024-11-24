import { Module } from '@nestjs/common';
import { CaddyService } from './caddy.service';

@Module({
  imports: [],
  providers: [CaddyService],
  exports: [CaddyService],
})
export class CaddyModule {}
