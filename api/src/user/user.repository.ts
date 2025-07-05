import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async findById(id: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdWithAllData(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async nbUsers() {
    return await this.prismaService.user.count();
  }

  async createUser(data: {
    email: string;
    name: string;
    role: string;
  }): Promise<User | null> {
    return this.prismaService.user.create({
      data,
    });
  }

  async updatePassword(id: string, password: string) {
    return await this.prismaService.user.update({
      where: { id },
      data: { password },
    });
  }

  async updateActiveStatus(id: string, value: boolean) {
    return await this.prismaService.user.update({
      where: { id },
      data: { isActive: value },
    });
  }

  async delete(id: string) {
    return await this.prismaService.user.delete({
      where: { id },
    });
  }
}
