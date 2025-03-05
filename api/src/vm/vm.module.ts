import { Module } from '@nestjs/common';
import { VmService } from './vm.service';
import { VmRepository } from './vm.repository';
import { WebsocketModule } from '../websockets/websocket.module';
import { NetworksModule } from 'src/networks/networks.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule, WebsocketModule, NetworksModule],
    providers: [VmService, VmRepository],
    exports: [VmService, VmRepository],
})
export class VmModule { }
