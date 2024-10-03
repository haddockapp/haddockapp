import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDomainDto } from './dto/create-domain.dto';
import { DomainRepository } from './domains.repository';
import { Domain } from '@prisma/client';
import { cpSync } from 'fs';
import { DomainResponseDto } from './dto/domain-response.dto';
import { BindingService } from './dns/binding.service';
import { DomainStatusDto } from './dto/domain-status.dto';
import { DnsService } from './dns/dns.service';

@Injectable()
export class DomainsService {

  constructor (
    private domainRepository: DomainRepository,
    private bindingService: BindingService,
    private dnsService: DnsService
  ) {}

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

  async getDomainStatus(id: string): Promise<DomainStatusDto> {
    const domain = await this.domainRepository.findDomainById(id);

    const primaryStatus = await this.dnsService.getPrimaryStatus(domain);
    const wildcardStatus = await this.dnsService.getWildcardStatus(domain);
    const challengeStatus = await this.dnsService.getChallengeStatus(domain);

    const canBeLinked = primaryStatus && challengeStatus && (!domain.main || wildcardStatus);
    await this.domainRepository.linkDomain(id, canBeLinked);

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
}
