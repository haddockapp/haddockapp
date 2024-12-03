import { Injectable } from "@nestjs/common";
import { ConfigurationRepository } from "./configuration.repository";
import { GithubConfiguration } from "./model/github-configuration";
import { GITHUB_ID_KEY, GITHUB_SECRET_KEY } from "./utils/consts";
import { Prisma } from "@prisma/client";

@Injectable()
export class ConfigurationService {
    constructor(private readonly configurationRepository: ConfigurationRepository) {}

    async checkGithubTokensConformity(clientId: string, clientSecret: string): Promise<boolean> {
        // @TODO: Validate using RegExp
        // @TODO: Validate using Github API
        return true;
    }

    async getGithubConfiguration(): Promise<GithubConfiguration | null> {
        const configs = await this.configurationRepository.getConfigurationByKeys([GITHUB_ID_KEY, GITHUB_SECRET_KEY]);
        if (configs.length !== 2) {
            return null;
        }

        return {
            client_id: configs.find((e) => e.key === GITHUB_ID_KEY).value.toString(),
            client_secret: configs.find((e) => e.key === GITHUB_SECRET_KEY).value.toString(),
        };
    }

    async modifyGithubConfiguration(client_id: string, client_secret: string) {
        const config = await this.getGithubConfiguration();
        if (!config) {
            await this.configurationRepository.createConfiguration(GITHUB_ID_KEY, client_id);
            await this.configurationRepository.createConfiguration(GITHUB_SECRET_KEY, client_secret);
        } else {
            await this.configurationRepository.updateConfiguration(GITHUB_ID_KEY, client_id);
            await this.configurationRepository.updateConfiguration(GITHUB_SECRET_KEY, client_secret);
        }
    }

    async modifyConfiguration(key: string, value: Prisma.JsonValue) {
        const exists = await this.configurationRepository.getConfigurationByKey(key);
        if (!exists) {
            await this.configurationRepository.createConfiguration(key, value);
        } else {
            await this.configurationRepository.updateConfiguration(key, value);
        }
    }
}
