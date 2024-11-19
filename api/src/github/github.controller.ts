import { Body, Controller, Get, Param, Post, UnauthorizedException } from '@nestjs/common';
import { GithubService } from './github.service';
import { User } from '@prisma/client';
import { AuthorizationRepository } from 'src/authorization/authorization.repository';
import { CurrentUser } from 'src/auth/user.context';
import Repository from './model/Repository';

@Controller('github')
export class GithubController {
  constructor(
    private githubService: GithubService,
    private authorizationRepository: AuthorizationRepository,
  ) {}

  @Get('/repository')
  async getUserRepositories(@CurrentUser() user: User): Promise<Repository[]> {
    const authorization = await this.authorizationRepository.findByUserId(
      user.id,
    );
    if (!authorization) {
      throw new UnauthorizedException(
        'A Github connection is required to perform this action.',
      );
    }

    console.log(authorization);

    return await this.githubService.getUserRepositoriesList(
      authorization.value,
    );
  }

  @Get('/repository/:orga/:name')
  async getRepositoryByName(
    @CurrentUser() user: User,
    @Param('orga') organisation: string,
    @Param('name') repositoryName: string,
  ) {
    const authorization = await this.authorizationRepository.findByUserId(
      user.id,
    );
    if (!authorization) {
      throw new UnauthorizedException(
        'A Github connection is required to perform this actions.',
      );
    }

    return await this.githubService.getRepositoryByName(
      authorization.value,
      organisation,
      repositoryName,
    );
  }

  @Get('/repository/:orga/:name/branches')
  async getUserRepositoryBranches(
    @CurrentUser() user: User,
    @Param('orga') organisation: string,
    @Param('name') repositoryName: string,
  ) {
    const authorization = await this.authorizationRepository.findByUserId(
      user.id,
    );
    if (!authorization) {
      throw new UnauthorizedException(
        'A Github connection is required to perform this actions.',
      );
    }

    const branches = await this.githubService.getRepositoryBranches(
      authorization.value,
      organisation,
      repositoryName,
    );
    return branches.map((branch) => branch.name);
  }
}
