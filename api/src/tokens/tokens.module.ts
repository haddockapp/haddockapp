import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectTokenController } from '../project/project-token.controller';
import { ProjectTokenService } from '../project/project-token.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectTokenController],
  providers: [ProjectTokenService],
  exports: [ProjectTokenService],
})
export class TokensModule {}
