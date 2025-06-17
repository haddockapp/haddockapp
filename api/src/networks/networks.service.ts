import { BadRequestException, Injectable } from '@nestjs/common';
import { NetworkConnection } from '@prisma/client';
import { CreateNetworkConnectionDto } from '../networks/dto/CreateNetworkConnectionDto';
import { UpdateNetworkConnectionDto } from '../networks/dto/UpdateNetworkConnectionDto';
import { NetworksRepository } from './networks.repository';
import { CaddyService } from '../caddy/caddy.service';
import { DomainRepository } from '../domains/domains.repository';

@Injectable()
export class NetworksService {

  constructor(
    private readonly networksRepository: NetworksRepository,
    private readonly domainRepository: DomainRepository,
    private readonly caddyService: CaddyService
  ) {
  }

  async updateNetworksfile() {
    const networkConnections =
      await this.networksRepository.findNetworkConnectionsAndProjectAndVm();

    const data = {
      data: networkConnections.map((networkConnection) => ({
        hostname: `${networkConnection.https ? "" : "http://"}${networkConnection.domain}`,
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

  private extractRootDomain(input: string): string | null {
    try {
      const url = new URL(input.includes("://") ? input : `http://${input}`);
      const hostname = url.hostname;

      const parts = hostname.split('.');

      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }

      return hostname;
    } catch {
      return null;
    }
  }

  async createNetworkConnection(
    data: CreateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    const domainName = this.extractRootDomain(data.domain);
    if (!domainName) {
      throw new BadRequestException('Invalid domain name');
    }

    const existingDomain = await this.domainRepository.findDomainByName(domainName);
    if (!existingDomain) {
      throw new BadRequestException('Domain does not exist');
    }

    const networkconnection =
      await this.networksRepository.createNetworkConnection(data, existingDomain.https);

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
