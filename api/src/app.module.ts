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
import { NetworksModule } from './networks/networks.module';
import { DomainsModule } from './domains/domains.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { StartupModule } from './startup/startup.module';

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
    CaddyModule,
    NetworksModule,
    DomainsModule,
    ConfigurationModule,
    StartupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
