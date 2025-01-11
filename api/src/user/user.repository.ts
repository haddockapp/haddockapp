import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserStatusEnum } from './types/user-status.enum';

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async createUser(
    email: string,
    name: string,
    status = UserStatusEnum.REGISTERED,
  ): Promise<User | null> {
    return this.prismaService.user.create({
      data: {
        email,
        name,
        status,
      },
    });
  }

  async updateUser(id: string, data: Partial<Omit<User, 'id'>>) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data,
    });
  }
}
