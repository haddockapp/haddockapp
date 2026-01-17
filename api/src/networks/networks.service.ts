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
    private readonly caddyService: CaddyService,
  ) {}

  async updateNetworksfile() {
    const networkConnections =
      await this.networksRepository.findNetworkConnectionsAndProjectAndVm();

    const data = {
      data: networkConnections.map((networkConnection) => ({
        hostname: `${networkConnection.https ? '' : 'http://'}${networkConnection.domain}`,
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

  private validateDomain(prefix: string, isAppliedOnMainDomain: boolean) {
    if (isAppliedOnMainDomain && prefix === 'api') {
      throw new BadRequestException(
        'The prefix "api" is reserved and cannot be used.',
      );
    }
    const regex = /^([a-zA-Z0-9]+\.)*[a-zA-Z0-9]+$/;
    if (!regex.test(prefix)) {
      throw new BadRequestException('Invalid domain format');
    }
  }

  async createNetworkConnection(
    data: CreateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    const domainName = await this.domainRepository.findDomainById(
      data.domainId,
    );
    if (!domainName) {
      throw new BadRequestException('Domain does not exist');
    }
    this.validateDomain(data.prefix, domainName.main);

    const networkconnection =
      await this.networksRepository.createNetworkConnection(
        data,
        domainName.domain,
        domainName.https,
      );

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
