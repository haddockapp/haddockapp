import { Injectable } from '@nestjs/common';
import axios from 'axios';
import UserInfos from './model/UserInfos';
import Repository from './model/Repository';
import Email from './model/Email';
import Branch from './model/Branch';

@Injectable()
export class GithubService {
  private async execGetRequest(url: string, token: string): Promise<any> {
    return await axios.get(`https://api.github.com/${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getUserEmails(token: string): Promise<Email[]> {
    const res = await this.execGetRequest('user/emails', token);
    return res.data;
  }

  async getUserPrimaryEmail(token: string): Promise<string> {
    const emails = await this.getUserEmails(token);
    return emails.filter((email) => email.primary === true)[0].email;
  }

  async getUserInfos(token: string): Promise<UserInfos> {
    const res = await this.execGetRequest('user', token);
    return res.data;
  }

  async getUserRepositoriesList(token: string): Promise<Repository[]> {
    // Max repository per page = 100
    const res = await this.execGetRequest('user/repos?per_page=100', token);
    return res.data;
  }

  async getRepositoryBranches(
    token: string,
    organisation: string,
    repositoryName: string,
  ): Promise<Branch[]> {
    const res = await this.execGetRequest(
      `repos/${organisation}/${repositoryName}/branches`,
      token,
    );
    return res.data;
  }

  async getRepositoryByName(
    token: string,
    organisation: string,
    repositoryName: string,
  ): Promise<Repository> {
    const res = await this.execGetRequest(
      `/repos/${organisation}/${repositoryName}`,
      token,
    );
    return res.data;
  }
}
