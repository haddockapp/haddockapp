import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NetworkConnection } from '@prisma/client';
import { NetworksService } from './networks.service';
import { CreateNetworkConnectionDto } from './dto/CreateNetworkConnectionDto';
import { UpdateNetworkConnectionDto } from './dto/UpdateNetworkConnectionDto';
import { NetworksRepository } from './networks.repository';

@Controller('network-connection')
export class NetworksController {
  constructor(
    private networksService: NetworksService,
    private networksRepository: NetworksRepository,
  ) {}

  @Get('project/:id')
  async getAllNetworkConnections(@Param('id') projectId: string) {
    return await this.networksRepository.findNetworkConnectionsByProjectId(
      projectId,
    );
  }

  @Post()
  async createNetworkConnection(
    @Body() data: CreateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    return await this.networksService.createNetworkConnection(data);
  }

  @Patch(':id')
  async updateNetworkConnection(
    @Param('id') networkConnectionId: string,
    @Body() data: UpdateNetworkConnectionDto,
  ) {
    const network_connection =
      await this.networksRepository.findNetworkConnectionById(
        networkConnectionId,
      );

    if (!network_connection) {
      throw new NotFoundException('Netowrk connection not found.');
    }

    return await this.networksService.updateNetworkConnection(
      networkConnectionId,
      data,
    );
  }

  @Delete(':id')
  async deleteNetworkConnection(@Param('id') networkConnectionId: string) {
    await this.networksService.deleteNetworkConnection(networkConnectionId);
  }
}
