import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module';
import { TokensModule } from '../tokens/tokens.module';
import { CliController } from './cli.controller';
import { CliService } from './cli.service';

@Module({
  imports: [ProjectModule, TokensModule],
  controllers: [CliController],
  providers: [CliService],
  exports: [CliService]
})
export class CliModule {}
