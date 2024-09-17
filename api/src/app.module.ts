import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VmModule } from './vm/vm.module';
import {AuthModule} from "./auth/auth.module";
import {ProjectModule} from "./project/project.module";
import { DockerModule } from './docker/docker.module';
import { SourceModule } from './source/source.module';
import { BullModule } from '@nestjs/bull';
import { WebsocketModule } from './websockets/websocket.module';
import { CaddyModule } from './caddy/caddy.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    VmModule,
    AuthModule,
    ProjectModule,
    SourceModule,
    DockerModule,
    WebsocketModule,
    CaddyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
