import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { VmModule } from 'src/vm/vm.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DeployConsumer } from './deploy.processor';
import { SourceFactory } from './source.factory';
import { SourceService } from './source.service';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => VmModule),
        BullModule.registerQueue({
            name: 'deploys',
        }),
        AuthorizationModule
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
