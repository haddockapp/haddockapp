import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { InvitationRepository } from './invitation.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PrismaModule, forwardRef(() => UserModule)],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationRepository],
  exports: [InvitationRepository],
})
export class InvitationModule {}
