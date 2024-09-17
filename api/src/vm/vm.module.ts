import { Module } from '@nestjs/common';
import { VmService } from './vm.service';
import { VmController } from './vm.controller';
import { VmRepository } from './vm.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WebsocketModule } from '../websockets/websocket.module';

@Module({
    imports: [PrismaModule, WebsocketModule],
    providers: [VmService, VmRepository],
    controllers: [VmController],
    exports: [VmService],
})
export class VmModule { }
