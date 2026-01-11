import { Module } from '@nestjs/common';
import { UnifiedDeployController } from './unified-deploy.controller';
import { UnifiedDeployService } from './unified-deploy.service';
import { ProjectModule } from 'src/project/project.module';
import { DomainsModule } from 'src/domains/domains.module';
import { NetworksModule } from 'src/networks/networks.module';
import { SourceModule } from 'src/source/source.module';

@Module({
  imports: [ProjectModule, DomainsModule, NetworksModule, SourceModule],
  controllers: [UnifiedDeployController],
  providers: [UnifiedDeployService],
})
export class UnifiedDeployModule {}
