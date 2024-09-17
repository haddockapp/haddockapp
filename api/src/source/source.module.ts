import { BullModule } from '@nestjs/bull';
import { Logger, Module } from '@nestjs/common';
import { VmModule } from 'src/vm/vm.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WebsocketModule } from '../websockets/websocket.module';
import { DeployConsumer } from './deploy.processor';
import { SourceFactory } from './source.factory';
import { SourceService } from './source.service';

@Module({
    imports: [
        PrismaModule,
        VmModule,
        BullModule.registerQueue({
            name: 'deploys',
        }),
    ],
    providers: [
        SourceService,
        SourceFactory,
        DeployConsumer
    ],
    exports: [
        SourceService
    ],
})
export class SourceModule { }
