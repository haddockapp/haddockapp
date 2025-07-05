import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { InviteUserDto } from './dto/invite-user.dto';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @UseGuards(AdminGuard)
  async inviteUser(@Body() body: InviteUserDto) {
    return await this.invitationService.createInvitation(body.email);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteInvitation(@Param('id') id: string) {
    await this.invitationService.deleteInvitationById(id);
  }
}
