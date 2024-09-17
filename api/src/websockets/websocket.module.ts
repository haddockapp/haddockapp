import { Module } from '@nestjs/common';
import { WSGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';

@Module({
    providers: [
        WebSocketService,
        WSGateway
    ],
    exports: [
        WebSocketService
    ]
})
export class WebsocketModule { }
