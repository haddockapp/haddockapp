import { Module } from '@nestjs/common';
import { AutologinsService } from './autologins.service';
import { UserModule } from '../user/user.module';
import { AutologinsController } from './autologins.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [AutologinsController],
  providers: [AutologinsService],
  exports: [AutologinsService],
})
export class AutologinsModule {}
