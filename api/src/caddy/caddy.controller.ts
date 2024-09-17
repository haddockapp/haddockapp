import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NetworkConnection } from '@prisma/client';
import { CaddyService } from './caddy.service';
import { CreateNetworkConnectionDto } from './dto/CreateNetworkConnectionDto';
import { UpdateNetworkConnectionDto } from './dto/UpdateNetworkConnectionDto';
import { CaddyRepository } from './caddy.repository';

@Controller('network-connection')
export class CaddyController {
  constructor(
    private caddyService: CaddyService,
    private caddyRepository: CaddyRepository,
  ) {}

  @Post()
  async createNetworkConnection(
    @Body() data: CreateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    return await this.caddyService.createNetworkConnection(data);
  }

  @Patch(':id')
  async updateNetworkConnection(
    @Param('id') networkConnectionId: string,
    @Body() data: UpdateNetworkConnectionDto,
  ) {
    const network_connection =
      await this.caddyRepository.findNetworkConnectionById(networkConnectionId);

    if (!network_connection) {
      throw new NotFoundException('Netowrk connection not found.');
    }

    return await this.caddyService.updateNetworkConnection(
      networkConnectionId,
      data,
    );
  }

  @Delete(':id')
  async deleteNetworkConnection(@Param('id') networkConnectionId: string) {
    await this.caddyService.deleteNetworkConnection(networkConnectionId);
  }
}
