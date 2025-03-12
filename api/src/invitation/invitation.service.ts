import { BadRequestException, Injectable } from '@nestjs/common';
import { InvitationRepository } from './invitation.repository';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll() {
    return await this.invitationRepository.findAll();
  }

  async createInvitation(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (user) throw new BadRequestException();

    return await this.invitationRepository.create(email);
  }

  async deleteInvitation(id: string) {
    return await this.invitationRepository.delete(id);
  }
}
