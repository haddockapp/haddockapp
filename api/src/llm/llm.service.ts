import { Injectable } from '@nestjs/common';
import { compile } from 'handlebars';
import { readFileSync } from 'node:fs';
import { DomainRepository } from '../domains/domains.repository';

@Injectable()
export class LlmService {
    private readonly template: HandlebarsTemplateDelegate;
    constructor(
        private readonly domainRepository: DomainRepository,
    ) {
        this.template = compile(
            readFileSync(
                './src/llm/template/llms.txt.hbs',
                'utf-8',
            ),
        );
    }

    async getAvailableDomains(): Promise<string[]> {
        const domains = await this.domainRepository.findAllDomains();
        return domains.map(d => d.domain);
    }

    async buildApiUrl(): Promise<string> {
        const mainDomain = await this.domainRepository.getMainDomain();
        return `${mainDomain.https ? 'https' : 'http'}://api.${mainDomain.domain}`;
    }

    async buildLlmsTxt(): Promise<string> {
        return this.template({
            domains: (await this.getAvailableDomains()).join(', '),
            baseUrl: await this.buildApiUrl(),
        });
    }
}
