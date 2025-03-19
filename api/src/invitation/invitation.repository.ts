import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvitationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.invitation.findMany();
  }

  async findByEmail(email: string) {
    return await this.prismaService.invitation.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await this.prismaService.invitation.findUnique({
      where: { id },
    });
  }

  async create(email: string) {
    return await this.prismaService.invitation.create({
      data: { email },
    });
  }

  async delete(id: string) {
    return await this.prismaService.invitation.delete({
      where: { id },
    });
  }
}
