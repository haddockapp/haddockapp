import { Injectable } from '@nestjs/common';
import { NetworkConnection } from '@prisma/client';
import { CreateNetworkConnectionDto } from '../networks/dto/CreateNetworkConnectionDto';
import { UpdateNetworkConnectionDto } from '../networks/dto/UpdateNetworkConnectionDto';
import { NetworksRepository } from './networks.repository';
import { CaddyService } from '../caddy/caddy.service';

@Injectable()
export class NetworksService {

  constructor(
    private readonly networksRepository: NetworksRepository,
    private readonly caddyService: CaddyService
  ) {
  }

  async updateNetworksfile() {
    const networkConnections =
      await this.networksRepository.findNetworkConnectionsAndProjectAndVm();

    const data = {
      data: networkConnections.map((networkConnection) => ({
        hostname: networkConnection.domain,
        ip: networkConnection.project.vm.ip,
        port: networkConnection.port,
      })),
    };

    const dest = `${process.env.CADDY_ROOT_DIR}/${process.env.CADDY_SERVICES_FILE}`;

    await this.caddyService.generate({
      template: 'reverse-proxies.hbs',
      data,
      dest,
    });
  }

  async createNetworkConnection(
    data: CreateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    const networkconnection =
      await this.networksRepository.createNetworkConnection(data);

    await this.updateNetworksfile();

    return networkconnection;
  }

  async updateNetworkConnection(
    networkConnectionId: string,
    data: UpdateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    const networkconnection =
      await this.networksRepository.updateNetworkConnection(
        networkConnectionId,
        data,
      );

    await this.updateNetworksfile();

    return networkconnection;
  }

  async deleteNetworkConnection(networkConnectionId: string) {
    await this.networksRepository.deleteNetworkConnection(networkConnectionId);

    await this.updateNetworksfile();
  }
}
