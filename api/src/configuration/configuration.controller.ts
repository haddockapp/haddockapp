import { BadRequestException, Body, Controller, Get, Post } from "@nestjs/common";
import { ConfigurationRepository } from "./configuration.repository";
import { SetupGitbubDto } from "./dto/setup-github.dto";
import { AppConfiguration } from "@prisma/client";
import { ConfigurationService } from "./configuration.service";
import { Public, PublicConfig } from "src/auth/auth.decorator";

@Controller('configuration')
export class ConfigurationController {
    constructor(
        private readonly configurationRepository: ConfigurationRepository,
        private readonly configurationService: ConfigurationService,
    ) {}

    @Get()
    async getConfiguration() {
        return this.configurationRepository.getConfiguration();
    }

    @PublicConfig()
    @Post('github')
    async setupGithub(@Body() data: SetupGitbubDto) {
        const dataConform = await this.configurationService.checkGithubTokensConformity(data.client_id, data.client_secret);
        if (!dataConform) {
            throw new BadRequestException('Given tokens are not conforms to Github OAuth Application');
        }

        await this.configurationService.modifyGithubConfiguration(data.client_id, data.client_secret);
    }
}
