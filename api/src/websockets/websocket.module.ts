import { Module } from '@nestjs/common';
import { WSGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [ProjectModule],
  providers: [WebSocketService, WSGateway],
  exports: [WebSocketService],
})
export class WebsocketModule {}
