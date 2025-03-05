import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectController } from './project.controller';
import { ProjectRepository } from './project.repository';
import { SourceModule } from '../source/source.module';
import { ComposeModule } from 'src/compose/compose.module';
import { DockerModule } from 'src/docker/docker.module';
import { ProjectService } from './project.service';
import { VmModule } from 'src/vm/vm.module';
import { NetworksModule } from 'src/networks/networks.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { WebsocketModule } from 'src/websockets/websocket.module';

@Module({
  imports: [
    PrismaModule,
    SourceModule,
    ComposeModule,
    DockerModule,
    forwardRef(() => VmModule),
    NetworksModule,
    AuthorizationModule,
    forwardRef(() => WebsocketModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
  exports: [ProjectRepository],
})
export class ProjectModule {}
