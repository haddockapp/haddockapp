import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import JwtBody from './dto/JwtBody.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/Signup.dto';
import { SigninDto } from './dto/Signin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private userRepository: UserRepository,
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

  async signup(dto: SignupDto): Promise<User> {
    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: passwordHash,
      },
    });
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
