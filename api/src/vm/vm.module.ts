import { Module } from '@nestjs/common';
import { VmService } from './vm.service';
import { VmRepository } from './vm.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WebsocketModule } from '../websockets/websocket.module';
import { NetworksModule } from 'src/networks/networks.module';

@Module({
    imports: [PrismaModule, WebsocketModule, NetworksModule],
    providers: [VmService, VmRepository],
    exports: [VmService],
})
export class VmModule { }
