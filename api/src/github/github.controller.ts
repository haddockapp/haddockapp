import { Controller, Get, Param, Query, UnauthorizedException } from '@nestjs/common';
import { GithubService } from './github.service';
import Repository from './model/Repository';

@Controller('github')
export class GithubController {
  constructor(
    private githubService: GithubService,
  ) { }

  @Get('/repository')
  async getUserRepositories(
    @Query('authorization') authorization?: string,
  ): Promise<Repository[]> {
    if (!authorization) {
      throw new UnauthorizedException(
        'A Github connection is required to perform this action.',
      );
    }

    console.log(authorization);

    return await this.githubService.getUserRepositoriesList(
      authorization,
    );
  }

  @Get('/repository/:orga/:name')
  async getRepositoryByName(
    @Param('orga') organisation: string,
    @Param('name') repositoryName: string,
    @Query('authorization') authorization?: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException(
        'A Github connection is required to perform this actions.',
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
      throw new UnauthorizedException(
        'A Github connection is required to perform this actions.',
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
