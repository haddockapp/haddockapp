import { Controller, ForbiddenException, Get, Param, Query } from '@nestjs/common';
import { GithubService } from './github.service';
import Repository from './model/Repository';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('/repository')
  async getUserRepositories(
    @Query('authorization') authorization?: string,
  ): Promise<Repository[]> {
    if (!authorization) {
      throw new ForbiddenException(
        'A Github connection is required to perform this action.',
      );
    }

    return await this.githubService.getUserRepositoriesList(authorization);
  }

  @Get('/repository/:orga/:name')
  async getRepositoryByName(
    @Param('orga') organisation: string,
    @Param('name') repositoryName: string,
    @Query('authorization') authorization?: string,
  ) {
    if (!authorization) {
      throw new ForbiddenException(
        'A Github connection is required to perform this action.',
      );
    }

    return await this.githubService.getRepositoryByName(
      authorization,
      organisation,
      repositoryName,
    );
  }

  @Get('/repository/:orga/:name/branches')
  async getUserRepositoryBranches(
    @Param('orga') organisation: string,
    @Param('name') repositoryName: string,
    @Query('authorization') authorization?: string,
  ) {
    if (!authorization) {
      throw new ForbiddenException(
        'A Github connection is required to perform this action.',
      );
    }

    const branches = await this.githubService.getRepositoryBranches(
      authorization,
      organisation,
      repositoryName,
    );
    return branches.map((branch) => branch.name);
  }
}
