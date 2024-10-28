import { Injectable } from '@nestjs/common';
import { BindingService } from './binding.service';
import { Domain } from '@prisma/client';
import { promises as dns } from 'dns';

@Injectable()
export class DnsService {

  constructor(
    private readonly bindingService: BindingService,
  ) { }

  private async getARecords(domain: string) {
    try {
      return await dns.resolve4(domain);
    } catch (error) {
      return [];
    }
  }

  private async getChallengeRecords(domain: Domain) {
    try {
      return await dns.resolveTxt(this.bindingService.getChallengeRecordName(domain));
    } catch (error) {
      return [];
    }
  }

  async getPrimaryStatus(domain: Domain) {
    const aRecords = await this.getARecords(domain.domain);
    return aRecords.includes(this.bindingService.getServerIPv4());
  }

  async getWildcardStatus(domain: Domain) {
    const aRecords = await this.getARecords(`*.${domain.domain}`);
    return aRecords.includes(this.bindingService.getServerIPv4());
  }

  async getChallengeStatus(domain: Domain) {
    const txtRecords = await this.getChallengeRecords(domain);
    return txtRecords.some(e => e.includes(domain.challenge));
  }
}
