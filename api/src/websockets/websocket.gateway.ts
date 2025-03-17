import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { WebsocketConnectDto } from './dto/connect.dto';
import { ProjectEventDto } from './dto/project-event.dto';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class WSGateway implements OnGatewayDisconnect {
  constructor(private readonly websocketService: WebSocketService) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: Socket) {
    this.websocketService.removeClient(client);
  }

  @SubscribeMessage('join')
  async handleConnect(
    @MessageBody() data: WebsocketConnectDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.websocketService.addClient(data.userId, client);
  }

  @SubscribeMessage('project')
  async handleMetricsSubscribe(
    @MessageBody() data: ProjectEventDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (data.subscribe === false) {
      await this.websocketService.handleUnscribe(client, data);
    } else {
      await this.websocketService.handleSubscribe(client, data);
    }
  }
}
