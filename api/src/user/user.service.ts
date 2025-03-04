import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    } as UserResponseDto;
  }
}
