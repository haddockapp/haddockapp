import { Injectable } from "@nestjs/common";

@Injectable()
export class ConfigurationService {

    async checkGithubTokensConformity(clientId: string, clientSecret: string): Promise<boolean> {
        // @TODO: Validate using RegExp
        // @TODO: Validate using Github API
        return true;
    }
}
