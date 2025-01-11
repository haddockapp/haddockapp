import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentUser } from 'src/auth/user.context';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers() {
    return await this.userService.getAllUsers();
  }

  @Post(':id/password/ask-reset')
  async askUserPasswordReset(@Param('id') id: string) {
    await this.userService.askPasswordReset(id);
  }

  @Post(':id/password/reset')
  async resetUserPassword(
    @Param('id') id: string,
    @Body() body: ResetPasswordDto,
  ) {
    await this.userService.resetPassword(id, body);
  }

  @Get(':id/data')
  async getUserData(@Param('id') id: string) {
    return { id };
  }

  @Post('invite')
  async inviteUser(@Body() body: InviteUserDto, @CurrentUser() inviter: User) {
    console.log('current user:', inviter);
    await this.userService.inviteUser(inviter, body);
  }
}
