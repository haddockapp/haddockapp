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

@Injectable()
export class DomainsService {

  constructor (
    private readonly domainRepository: DomainRepository,
    private readonly bindingService: BindingService,
    private readonly dnsService: DnsService,
    private readonly frontendService: FrontendService,
    private readonly caddyService: CaddyService,
    private readonly configurationService: ConfigurationService,
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

    if (domain.main && canBeLinked) {
      const serverIp = '127.0.0.1';
      const dest = `${process.env.CADDY_ROOT_DIR}/${process.env.CADDY_APP_FILE}`;
      const data = {
        data: [
          {
            hostname: domain.domain,
            ip: serverIp,
            port: 3001,
          },
          {
            hostname: `api.${domain.domain}`,
            ip: serverIp,
            port: 3000,
          }
        ],
      };

      await this.caddyService.generate({
        template: 'reverse-proxies.hbs',
        data,
        dest,
      })
    }
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

  async apply() {
    const mainDomain = await this.domainRepository.getMainDomain();
    if (!mainDomain) {
      throw new ForbiddenException('Cannot apply without a main domain');
    }

    const status = await this.getDomainStatus(mainDomain.id);

    if (!status.canBeLinked) {
      throw new ForbiddenException('Cannot apply with the current domain status');
    }

    const dest = `${process.env.CADDY_ROOT_DIR}/${process.env.CADDY_APP_FILE}`;
    await this.caddyService.generate({
      template: 'reverse-proxies.hbs',
      data:{
        data: [
          {
            hostname: mainDomain.domain,
            ip: '127.0.0.1',
            port: +process.env.FRONTEND_PORT
          },
          {
            hostname: `api.${mainDomain.domain}`,
            ip: '127.0.0.1',
            port: +process.env.PORT
          },
        ]
      },
      dest,
    });

    await this.frontendService.setFrontendConfigValue('backendUrl', `https://api.${mainDomain.domain}`);
    await this.configurationService.modifyConfiguration(CONFIGURED_KEY, true);
    return {
      mainDomain: mainDomain.domain,
      frontendUrl: `https://${mainDomain.domain}`,
      backendUrl: `https://api.${mainDomain.domain}`
    }
  }
}
