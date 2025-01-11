import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import JwtBody from './dto/JwtBody.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/Signup.dto';
import { SigninDto } from './dto/Signin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/user/user.repository';
import { UserStatusEnum } from 'src/user/types/user-status.enum';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly cacheService: CacheService,
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

  async signup(
    dto: SignupDto,
    invitationCode: string | undefined,
  ): Promise<User> {
    if (invitationCode) {
      const email = await this.cacheService.getInvitation(invitationCode);
      if (email !== dto.email) {
        throw new BadRequestException('Wrong code');
      }
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: passwordHash,
        status: invitationCode
          ? UserStatusEnum.GUEST
          : UserStatusEnum.REGISTERED,
      },
    });

    if (invitationCode) {
      await this.cacheService.delInvitation(invitationCode);
    }

    return user;
  }

  async signin(dto: SigninDto): Promise<User> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('Unknown user');
    }

    if (!user.password) {
      throw new BadRequestException('Bad auth method');
    }

    const goodPassword = await this.verifyPassword(dto.password, user.password);
    if (!goodPassword) {
      throw new BadRequestException('Wrong password');
    }

    return user;
  }
}
