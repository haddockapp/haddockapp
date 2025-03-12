import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/auth/user.context';
import { UserService } from './user.service';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { AdminGuard } from 'src/auth/guard/admin.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  async getConnectedUserInformations(@CurrentUser() user: User) {
    return this.userService.toResponse(user);
  }

  @Get()
  async getUsers() {
    return this.userService.findAll();
  }

  @Put(':id/password')
  @UseGuards(AdminGuard)
  async modifyUserPassword(
    @Param('id') id: string,
    @Body() body: UpdateUserPasswordDto,
  ) {
    await this.userService.updateUserPassword(id, body);
  }

  @Put(':id/disable')
  @UseGuards(AdminGuard)
  async disableUser(@Param('id') id: string) {
    return await this.userService.disableUser(id);
  }

  @Put(':id/activate')
  @UseGuards(AdminGuard)
  async activateUser(@Param('id') id: string) {
    return await this.userService.activateUser(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
  }

  @Get(':id/data')
  async downloadUserData(@Param('id') id: string) {
    // @TODO: define user data scope
    return id;
  }
}
