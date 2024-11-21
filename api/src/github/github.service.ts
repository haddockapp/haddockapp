import { Injectable } from '@nestjs/common';
import axios from 'axios';
import UserInfos from './model/UserInfos';
import Repository from './model/Repository';
import Email from './model/Email';
import Branch from './model/Branch';
import { AuthorizationService } from '../authorization/authorization.service';

@Injectable()
export class GithubService {

  constructor(
    private readonly authorizationService: AuthorizationService
  ) {}

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
