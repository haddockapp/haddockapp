import { Injectable } from '@nestjs/common';
import { BindingService } from './binding.service';
import { Domain } from '@prisma/client';
import { promises as dns } from 'dns';

const DEFAULT_DNS_SERVERS = [
  '8.8.8.8',
  '1.1.1.1',
  '[2001:4860:4860::8888]',
  '[2606:4700:4700::1111]'
]

@Injectable()
export class DnsService {
  constructor(
    private readonly bindingService: BindingService,
  ) { }


  private async resolveNsIp(ns: string): Promise<string | null> {
    if (ns.match(/\d+\.\d+\.\d+\.\d+/)) return ns;

    try {
      const ips = await dns.resolve4(ns);
      return ips[0];
    } catch (error) {
      return null;
    }
  }

  private async getAuthoritativeNameserverIps(domain: string): Promise<string[]> {
    try {
      const nsServers = await dns.resolveNs(domain);
      const ipPromises = nsServers.map(ns => this.resolveNsIp(ns));
      const ips = await Promise.all(ipPromises);
      return ips.filter(ip => ip !== null);
    } catch (error) {
      return [];
    }
  }

  private async getRecords<T extends any[]>(domain: string, method: () => Promise<T>, nsDomain?: string): Promise<T> {
    const nsIps = await this.getAuthoritativeNameserverIps(nsDomain || domain);
    if (nsIps.length === 0) return [] as T;
    dns.setServers(nsIps);
    try {
      return await method();
    } catch (error) {
      return [] as T;
    } finally {
      dns.setServers(DEFAULT_DNS_SERVERS);
    }
  }

  private async getARecords(domain: string, nsDomain?: string) {
    return this.getRecords(domain, () => dns.resolve4(domain), nsDomain);
  }

  private async getChallengeRecords(domain: Domain, nsDomain?: string) {
    return this.getRecords(
      this.bindingService.getChallengeRecordName(domain),
      () => dns.resolveTxt(this.bindingService.getChallengeRecordName(domain)),
      nsDomain
    );
  }

  async getPrimaryStatus(domain: Domain) {
    const aRecords = await this.getARecords(domain.domain, domain.domain);
    return aRecords.includes(this.bindingService.getServerIPv4());
  }

  async getWildcardStatus(domain: Domain) {
    const aRecords = await this.getARecords(`*.${domain.domain}`, domain.domain);
    return aRecords.includes(this.bindingService.getServerIPv4());
  }

  async getChallengeStatus(domain: Domain) {
    const txtRecords = await this.getChallengeRecords(domain, domain.domain);
    return txtRecords.some(e => e.includes(domain.challenge));
  }
}
