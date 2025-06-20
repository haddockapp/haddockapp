import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDomainDto } from './dto/create-domain.dto';
import { DomainRepository } from './domains.repository';
import { Domain } from '@prisma/client';
import { DomainResponseDto } from './dto/domain-response.dto';
import { BindingService } from './dns/binding.service';
import { DomainStatusDto } from './dto/domain-status.dto';
import { DnsService } from './dns/dns.service';
import { CaddyService } from '../caddy/caddy.service';
import { FrontendService } from '../frontend/frontend.service';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { CONFIGURED_KEY } from 'src/configuration/utils/consts';
import { AutologinsService } from '../autologins/autologins.service';

@Injectable()
export class DomainsService {

  constructor(
    private readonly domainRepository: DomainRepository,
    private readonly bindingService: BindingService,
    private readonly dnsService: DnsService,
    private readonly frontendService: FrontendService,
    private readonly caddyService: CaddyService,
    private readonly configurationService: ConfigurationService,
    private readonly autologinService: AutologinsService,
  ) { }

  private generateDomainChallenge() {
    return Array.from({ length: 32 }, () => {
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return characters.charAt(Math.floor(Math.random() * characters.length));
    }).join('');
  }

  private domainToResponse(domain: Domain): DomainResponseDto {
    return {
      id: domain.id,
      domain: domain.domain,
      main: domain.main,

      primaryBinding: this.bindingService.createPrimaryBinding(domain),
      wildcardBinding: this.bindingService.createWildcardBinding(domain),
      challengeBinding: this.bindingService.createChallengeBinding(domain),

      linked: domain.linked,
    };
  }

  async create(createDomainDto: CreateDomainDto) {
    const mainDomainExists = await this.domainRepository.hasMainDomain();

    if (createDomainDto.main && mainDomainExists) {
      throw new ForbiddenException('Main domain already exists');
    }
    if (!createDomainDto.main && !mainDomainExists) {
      throw new ForbiddenException('Main domain does not exist');
    }

    const challenge = this.generateDomainChallenge();
    const domain = await this.domainRepository.createDomain(createDomainDto, challenge);

    return this.domainToResponse(domain);
  }

  async findAll() {
    const domains = await this.domainRepository.findAllDomains();
    return domains.map(d => this.domainToResponse(d));
  }

  async findOne(id: string) {
    const domain = await this.domainRepository.findDomainById(id);
    return this.domainToResponse(domain);
  }

  private async linkDomain(domain: Domain, canBeLinked: boolean) {
    await this.domainRepository.linkDomain(domain.id, canBeLinked);
  }


  async getDomainStatus(id: string): Promise<DomainStatusDto> {
    const domain = await this.domainRepository.findDomainById(id);

    const primaryStatus = await this.dnsService.getPrimaryStatus(domain);
    const wildcardStatus = await this.dnsService.getWildcardStatus(domain);
    const challengeStatus = await this.dnsService.getChallengeStatus(domain);

    const canBeLinked = primaryStatus && challengeStatus && (!domain.main || wildcardStatus);

    await this.linkDomain(domain, canBeLinked);

    return {
      id: domain.id,
      domain: domain.domain,
      main: domain.main,

      primaryStatus,
      wildcardStatus,
      challengeStatus,

      canBeLinked
    }
  }

  async remove(id: string) {
    const domain = await this.domainRepository.deleteDomain(id);
    if (domain.main && domain.linked) {
      throw new ForbiddenException('Cannot delete a linked main domain');
    }
    return this.domainRepository.deleteDomain(id);
  }

  async apply(userId: string) {
    const mainDomain = await this.domainRepository.getMainDomain();
    if (!mainDomain) {
      throw new ForbiddenException('Cannot apply without a main domain');
    }

    const protocol = mainDomain.https ? 'https' : 'http';
    const caddyPrefix = mainDomain.https ? '' : 'http://'; // Should prefix with http to disable HTTPS in Caddy config

    const status = await this.getDomainStatus(mainDomain.id);

    if (!status.canBeLinked) {
      throw new ForbiddenException('Cannot apply with the current domain status');
    }

    const dest = `${process.env.CADDY_ROOT_DIR}/${process.env.CADDY_APP_FILE}`;
    await this.caddyService.generate({
      template: 'reverse-proxies.hbs',
      data: {
        data: [
          {
            hostname: `${caddyPrefix}${mainDomain.domain}`,
            ip: '127.0.0.1',
            port: +process.env.FRONTEND_PORT
          },
          {
            hostname: `${caddyPrefix}api.${mainDomain.domain}`,
            ip: '127.0.0.1',
            port: +process.env.PORT
          },
          {
            hostname: `${caddyPrefix}ws.${mainDomain.domain}`,
            ip: '127.0.0.1',
            port: +process.env.WS_PORT
          },
        ]
      },
      dest,
    });


    await this.frontendService.setFrontendConfigValue('backendUrl', `${protocol}://api.${mainDomain.domain}`);
    await this.frontendService.setFrontendConfigValue('socketUrl', `${protocol}://ws.${mainDomain.domain}`);
    await this.configurationService.modifyConfiguration(CONFIGURED_KEY, true);
    const autologinToken = await this.autologinService.generateToken(userId);

    return {
      mainDomain: mainDomain.domain,
      frontendUrl: `${protocol}://${mainDomain.domain}`,
      backendUrl: `${protocol}://api.${mainDomain.domain}`,
      socketUrl: `${protocol}://ws.${mainDomain.domain}`,
      autologin: autologinToken
    }
  }
}
