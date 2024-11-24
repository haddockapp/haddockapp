import { Module } from '@nestjs/common';
import { CaddyModule } from '../caddy/caddy.module';
import { FrontendModule } from '../frontend/frontend.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BindingService } from './dns/binding.service';
import { DnsService } from './dns/dns.service';
import { DomainsController } from './domains.controller';
import { DomainRepository } from './domains.repository';
import { DomainsService } from './domains.service';

@Module({
  imports: [PrismaModule, FrontendModule, CaddyModule],
  controllers: [DomainsController],
  providers: [
    DomainsService,
    BindingService,
    DnsService,
    DomainRepository
  ],
})
export class DomainsModule {}
