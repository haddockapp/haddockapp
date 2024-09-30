import { Module } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { NetworksController } from './networks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { VmModule } from '../vm/vm.module';
import { CaddyModule } from '../caddy/caddy.module';
import { NetworksRepository } from './networks.repository';

@Module({
  imports: [PrismaModule, VmModule, CaddyModule],
  controllers: [NetworksController],
  providers: [NetworksService, NetworksRepository],
})
export class NetworksModule {}
