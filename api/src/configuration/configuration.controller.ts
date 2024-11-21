import { BadRequestException, Body, Controller, Get, Post } from "@nestjs/common";
import { ConfigurationRepository } from "./configuration.repository";
import { Public } from "src/auth/auth.decorator";
import { SetupGitbubDto } from "./dto/setup-github.dto";
import { AppConfiguration } from "@prisma/client";
import { ConfigurationService } from "./configuration.service";

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

    @Public()
    @Post('github')
    async setupGithub(@Body() data: SetupGitbubDto) {
        const dto: Partial<AppConfiguration> = {
            github_client_id: data.client_id,
            github_client_secret: data.client_secret,
        };

        const isDataConform = await this.configurationService.checkGithubTokensConformity(dto.github_client_id, dto.github_client_id);
        if (!isDataConform) {
            throw new BadRequestException('Given tokens are not conforms to Github OAuth Application');
        }

        try {
            const config = await this.configurationRepository.getConfiguration();
            await this.configurationRepository.updateConfiguration(config.id, dto);
        } catch (e: any) {
            if (e.code !== 'P2025') {
                throw new Error(e);
            }

            await this.configurationRepository.createConfiguration(dto);
        }
    }
}
