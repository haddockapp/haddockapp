import { Controller, Get } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/auth/user.context';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  async getConnectedUserInformations(@CurrentUser() user: User) {
    return this.userService.toResponse(user);
  }
}
