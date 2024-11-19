import { Body, Controller, Get, Post } from "@nestjs/common";
import { ConfigurationRepository } from "./configuration.repository";
import { SetupGithubDto } from "./dto/setup-github.dto";
import { Public } from "src/auth/auth.decorator";
import { AppConfiguration } from "@prisma/client";

@Controller('configuration')
export class ConfigurationController {
    constructor(private readonly configurationRepository: ConfigurationRepository) {}

    @Get()
    async getConfiguration() {
        return this.configurationRepository.getConfiguration();
    }

    @Public()
    @Post('github')
    async setupGithub(@Body() data: SetupGithubDto) {
        const dto: Partial<AppConfiguration> = {
            github_client_id: data.client_id,
            github_client_secret: data.client_secret,
        };

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
