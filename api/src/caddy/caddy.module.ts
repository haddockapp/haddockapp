import { Module } from '@nestjs/common';
import { CaddyService } from './caddy.service';
import { CaddyController } from './caddy.controller';
import { VmModule } from 'src/vm/vm.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CaddyRepository } from './caddy.repository';

@Module({
  imports: [VmModule, PrismaModule],
  providers: [CaddyService, CaddyRepository],
  controllers: [CaddyController],
})
export class CaddyModule {}
