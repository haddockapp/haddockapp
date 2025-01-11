import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { UserResponseDto } from './dto/user-response.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { CacheService } from 'src/cache/cache.service';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
  ) {}

  private userToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    };
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.userToResponse(user));
  }

  async inviteUser(inviter: User, body: InviteUserDto) {
    const user = await this.userRepository.findByEmail(body.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const { email } = body;
    const code = uuid();

    await this.cacheService.setInvitation(code, email);
    await this.emailService.sendInvitation(inviter, email, code);
  }

  async askPasswordReset(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const code = uuid();
    await this.cacheService.setPasswordReset(code, user.id);
    this.emailService.sendPasswordReset(user.id, user.email, code);
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async resetPassword(id: string, body: ResetPasswordDto) {
    const { code, password } = body;
    const userId = await this.cacheService.getPasswordReset(code);
    if (userId !== id) {
      throw new BadRequestException('Wrong code');
    }

    const passwordHash = await this.hashPassword(password);
    const user = await this.userRepository.updateUser(id, {
      password: passwordHash,
    });

    if (user) {
      await this.cacheService.delInvitation(code);
    }
  }
}
