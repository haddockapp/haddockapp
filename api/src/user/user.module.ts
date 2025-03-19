import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { InvitationModule } from 'src/invitation/invitation.module';

@Module({
  imports: [PrismaModule, forwardRef(() => InvitationModule)],
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserRepository],
})
export class UserModule {}
