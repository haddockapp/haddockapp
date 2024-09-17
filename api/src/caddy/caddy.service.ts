import { Injectable } from '@nestjs/common';
import { CreateNetworkConnectionDto } from './dto/CreateNetworkConnectionDto';
import { NetworkConnection } from '@prisma/client';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { CaddyRepository } from './caddy.repository';
import { UpdateNetworkConnectionDto } from './dto/UpdateNetworkConnectionDto';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';

@Injectable()
export class CaddyService {
  private readonly template: HandlebarsTemplateDelegate<any>;

  constructor(private caddyRepository: CaddyRepository) {
    this.template = compile(
      readFileSync('./src/caddy/template/Caddyfile.hbs', 'utf-8'),
    );
  }

  private async updateCaddyfile() {
    const network_connections =
      await this.caddyRepository.findNetworkConnectionsAndProjectAndVm();

    const caddyfile = this.template({
      data: network_connections.map((network_connection) => ({
        hostname: network_connection.domain,
        ip: network_connection.project.vm.ip,
        port: network_connection.port,
      })),
    });

    await writeFile('./src/caddy/Caddyfile', caddyfile, {
      encoding: 'utf-8',
    });

    await new Promise<string>((resolve, reject) => {
      exec('cd ./src/caddy && caddy reload', (error, stdout) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      });
    });
  }

  async createNetworkConnection(
    data: CreateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    const network_connection =
      await this.caddyRepository.createNetworkConnection(data);

    await this.updateCaddyfile();

    return network_connection;
  }

  async updateNetworkConnection(
    networkConnectionId: string,
    data: UpdateNetworkConnectionDto,
  ): Promise<NetworkConnection> {
    const network_connection =
      await this.caddyRepository.updateNetworkConnection(
        networkConnectionId,
        data,
      );

    await this.updateCaddyfile();

    return network_connection;
  }

  async deleteNetworkConnection(networkConnectionId: string) {
    await this.caddyRepository.deleteNetworkConnection(networkConnectionId);

    await this.updateCaddyfile();
  }
}
