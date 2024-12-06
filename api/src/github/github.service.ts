import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { AuthError } from '../auth/error/AuthError';
import { AuthorizationService } from '../authorization/authorization.service';
import Branch from './model/Branch';
import Email from './model/Email';
import Repository from './model/Repository';
import UserInfos from './model/UserInfos';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class GithubService {

  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly configurationService: ConfigurationService,

  ) { }

  private async getWithAuthorization(url: string, authorizationId: string): Promise<any> {
    return await axios.get(`https://api.github.com/${url}`, {
      headers: await this.authorizationService.getHeadersForAuthorization(authorizationId),
    });
  }

  private async getWithToken(url: string, token: string): Promise<any> {
    return await axios.get(`https://api.github.com/${url}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
  }

  public async exchangeCode(code: string) {
    const config = await this.configurationService.getGithubConfiguration();
    if (!config) {
      throw new InternalServerErrorException('No Github OAuth Application setup yet');
    }

    const CLIENT_ID = config.client_id;
    const CLIENT_SECRET = config.client_secret;
    const URL = `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`;

    const { data } = await axios.post(
      URL,
      {},
      { headers: { Accept: 'application/json' } },
    );
    if (data.error) {
      throw new AuthError(data.error);
    }

    return data.access_token as string;

  }
  async getUserEmails(token: string): Promise<Email[]> {
    const res = await this.getWithToken('user/emails', token);
    return res.data;
  }

  async getUserPrimaryEmail(token: string): Promise<string> {
    const emails = await this.getUserEmails(token);
    return emails.filter((email) => email.primary === true)[0].email;
  }

  async getUserInfos(token: string): Promise<UserInfos> {
    const res = await this.getWithToken('user', token);
    return res.data;
  }

  async getUserRepositoriesList(authorizationId: string): Promise<Repository[]> {
    // Max repository per page = 100
    const res = await this.getWithAuthorization('user/repos?per_page=100', authorizationId);
    return res.data;
  }

  async getRepositoryBranches(
    authorizationId: string,
    organisation: string,
    repositoryName: string,
  ): Promise<Branch[]> {
    const res = await this.getWithAuthorization(
      `repos/${organisation}/${repositoryName}/branches`,
      authorizationId,
    );
    return res.data;
  }

  async getRepositoryByName(
    authorizationId: string,
    organisation: string,
    repositoryName: string,
  ): Promise<Repository> {
    const res = await this.getWithAuthorization(
      `/repos/${organisation}/${repositoryName}`,
      authorizationId,
    );
    return res.data;
  }
}
