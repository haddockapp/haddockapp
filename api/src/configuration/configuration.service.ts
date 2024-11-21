import { Injectable } from "@nestjs/common";
import { AppConfiguration } from "@prisma/client";
import { ConfigurationRepository } from "./configuration.repository";

@Injectable()
export class ConfigurationService {
    constructor(private readonly configurationRepository: ConfigurationRepository) {}

    async checkGithubTokensConformity(clientId: string, clientSecret: string): Promise<boolean> {
        // @TODO: Validate using RegExp
        // @TODO: Validate using Github API
        return true;
    }

    async modifyAppConfiguration(data: Partial<Omit<AppConfiguration, 'id'>>) {
        try {
            const config = await this.configurationRepository.getConfiguration();
            await this.configurationRepository.updateConfiguration(config.id, data);
        } catch (e: any) {
            if (e.code !== 'P2025') {
                throw new Error(e);
            }

            return await this.configurationRepository.createConfiguration(data);
        }
    }
}
