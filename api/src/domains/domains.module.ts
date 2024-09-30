import { Module } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';
import { BindingService } from './dns/binding.service';
import { DnsService } from './dns/dns.service';
import { DomainRepository } from './domains.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DomainsController],
  providers: [
    DomainsService,
    BindingService,
    DnsService,
    DomainRepository
  ],
})
export class DomainsModule {}
