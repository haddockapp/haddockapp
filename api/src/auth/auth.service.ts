import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import JwtBody from './dto/JwtBody.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/Signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/user/user.repository';
import { UserRoleEnum } from 'src/user/types/user-role.enum';
import { InvitationRepository } from 'src/invitation/invitation.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private userRepository: UserRepository,
    private invitationRepository: InvitationRepository,
  ) {}

  generateJwt(user: User): string {
    const body: JwtBody = { id: user.id, email: user.email, name: user.name };
    return this.jwtService.sign(body);
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private async verifyPassword(
    password: string,
    dbPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, dbPassword);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    if (!user.password) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;

    return user;
  }

  async signup(dto: SignupDto): Promise<User> {
    const count = await this.prismaService.user.count();

    const invitation = await this.invitationRepository.findByEmail(dto.email);
    if (!invitation && count > 0) throw new ForbiddenException();

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: passwordHash,
        role: count === 0 ? UserRoleEnum.ADMIN : UserRoleEnum.MEMBER,
      },
    });

    if (invitation && count > 0)
      await this.invitationRepository.delete(invitation.id);
    return user;
  }
}
