import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module';
import { TokensModule } from '../tokens/tokens.module';
import { CliController } from './cli.controller';

@Module({
  imports: [ProjectModule, TokensModule],
  controllers: [CliController],
  providers: [],
  exports: [],
})
export class CliModule {}
