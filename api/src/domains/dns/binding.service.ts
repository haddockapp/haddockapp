import { Injectable } from '@nestjs/common';
import { Domain } from '@prisma/client';
import * as os from 'os';

@Injectable()
export class BindingService {
  getServerIPv4(): string {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
    }
    throw new Error('No IPv4 address found');
  }

  createPrimaryBinding(domain: Domain) {
    const serverIPv4 = this.getServerIPv4();
    return `${domain.domain}. IN A ${serverIPv4}`;
  }

  createWildcardBinding(domain: Domain) {
    const serverIPv4 = this.getServerIPv4();
    return `*.${domain.domain}. IN A ${serverIPv4}`;
  }

  getChallengeRecordName(domain: Domain) {
    return `_haddock-challenge.${domain.domain}`;
  }

  createChallengeBinding(domain: Domain) {
    return `${this.getChallengeRecordName(domain)} IN TXT "${domain.challenge}"`;
  }
}
