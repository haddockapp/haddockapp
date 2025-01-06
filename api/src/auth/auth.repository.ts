import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from './dto/CreateAuth.dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async find(userId: string) {
    return await this.prismaService.auth.findUnique({
      where: {
        userId,
      },
    });
  }

  async create(userId: string, dto: CreateAuthDto) {
    return await this.prismaService.auth.create({
      data: {
        type: dto.type,
        value: dto.value,
        user: {
          connect: { id: userId },
        },
      },
    });
  }
}
