import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Invitation, User } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { InvitationRepository } from 'src/invitation/invitation.repository';
import { UserRoleEnum } from './types/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly invitationRepository: InvitationRepository,
  ) {}

  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  private invitationToResponse(invitation: Invitation): UserResponseDto {
    return {
      id: invitation.id,
      name: invitation.email,
      email: invitation.email,
      role: 'invited',
      isActive: true,
    };
  }

  async findAll() {
    const users = await this.userRepository.findAll();
    const invitations = await this.invitationRepository.findAll();

    return [
      ...users.map(this.toResponse),
      ...invitations.map(this.invitationToResponse),
    ];
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async updateUserPassword(id: string, body: UpdateUserPasswordDto) {
    const user = await this.userRepository.findById(id);
    if (!user || !user.password) {
      throw new BadRequestException();
    }

    const hash = await this.hashPassword(body.password);
    return await this.userRepository.updatePassword(id, hash);
  }

  async disableUser(id: string) {
    const user = await this.userRepository.findById(id);
    if (user.role === UserRoleEnum.ADMIN) {
      throw new ForbiddenException();
    }

    return await this.userRepository.updateActiveStatus(id, false);
  }

  async activateUser(id: string) {
    return await this.userRepository.updateActiveStatus(id, true);
  }

  async deleteUser(id: string) {
    return await this.userRepository.delete(id);
  }

  async getAllUserData(id: string) {
    return id;
  }
}
