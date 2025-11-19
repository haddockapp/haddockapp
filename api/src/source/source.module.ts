import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { VmModule } from 'src/vm/vm.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DeployConsumer } from './deploy.processor';
import { SourceFactory } from './source.factory';
import { SourceService } from './source.service';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SourceRepository } from './source.repository';
import { ProjectModule } from 'src/project/project.module';
import { ComposeModule } from 'src/compose/compose.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => VmModule),
    forwardRef(() => ProjectModule),
    BullModule.registerQueue({
      name: 'deploys',
    }),
    AuthorizationModule,
    ComposeModule,
  ],
  providers: [SourceService, SourceFactory, DeployConsumer, SourceRepository],
  exports: [SourceService],
})
export class SourceModule {}
