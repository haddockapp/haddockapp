import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../auth/auth.decorator';
import { LlmService } from './llm.service';

@Controller()
export class LlmController {
    constructor(
        private readonly llmService: LlmService,
    ) {}

    @Get('llms.txt')
    @Public()
    @Header('Content-Type', 'text/plain; charset=utf-8')
    async getLlmsTxt(): Promise<string> {
        return await this.llmService.buildLlmsTxt();
    }
}
