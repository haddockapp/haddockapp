import { BadRequestException, Injectable } from '@nestjs/common';
import { InvitationRepository } from './invitation.repository';
import { UserRepository } from 'src/user/user.repository';
import { Invitation } from '@prisma/client';

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll() {
    return await this.invitationRepository.findAll();
  }

  async findByEmail(email: string) {
    return await this.invitationRepository.findByEmail(email);
  }

  async createInvitation(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (user) throw new BadRequestException();

    return await this.invitationRepository.create(email);
  }

  async deleteInvitationById(id: string) {
    return await this.invitationRepository.delete(id);
  }

  userCanRegister(nbUsers: number, invitation: Invitation) {
    return invitation || nbUsers === 0;
  }

  async deleteInvitation(invitation: Invitation) {
    if (invitation) {
      await this.invitationRepository.delete(invitation.id);
    }
  }
}
