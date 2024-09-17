import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { AuthError } from './error/AuthError';
import { User } from '@prisma/client';
import JwtBody from './dto/JwtBody.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  generateJwt(user: User): string {
    const body: JwtBody = { id: user.id, email: user.email, name: user.name };
    return this.jwtService.sign(body);
  }
}
