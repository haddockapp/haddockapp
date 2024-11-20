import { Module } from '@nestjs/common';
import { StartupService } from './startup.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VmModule } from 'src/vm/vm.module';
import { ProjectModule } from 'src/project/project.module';
import { NetworksModule } from 'src/networks/networks.module';

@Module({
  imports: [PrismaModule, ProjectModule, VmModule, NetworksModule],
  providers: [StartupService],
})
export class StartupModule {}
