import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNetworkConnectionDto } from './dto/CreateNetworkConnectionDto';
import { NetworkConnection, Prisma } from '@prisma/client';
import { UpdateNetworkConnectionDto } from './dto/UpdateNetworkConnectionDto';

@Injectable()
export class CaddyRepository {
  constructor(private prismaService: PrismaService) {}

  async findNetworkConnections(): Promise<NetworkConnection[]> {
    return this.prismaService.networkConnection.findMany();
  }

  async findNetworkConnectionsAndProjectAndVm(): Promise<
    Prisma.NetworkConnectionGetPayload<{
      include: { project: { include: { vm: true } } };
    }>[]
  > {
    return this.prismaService.networkConnection.findMany({
      include: {
        project: {
          include: {
            vm: true,
          },
        },
      },
    });
  }

  async findNetworkConnectionById(networkConnectionId: string) {
    return this.prismaService.networkConnection.findUnique({
      where: {
        id: networkConnectionId,
      },
    });
  }

  async createNetworkConnection(
    data: CreateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    const project = await this.prismaService.project.findUnique({
      where: {
        id: data.projectId,
      },
    });

    return this.prismaService.networkConnection.create({
      data: {
        domain: data.domain,
        port: data.port,
        projectId: project.id,
      },
    });
  }

  async updateNetworkConnection(
    networkConnectionId: string,
    data: UpdateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    return this.prismaService.networkConnection.update({
      where: {
        id: networkConnectionId,
      },
      data,
    });
  }

  async deleteNetworkConnection(networkConnectionId: string) {
    return this.prismaService.networkConnection.delete({
      where: {
        id: networkConnectionId,
      },
    });
  }
}
