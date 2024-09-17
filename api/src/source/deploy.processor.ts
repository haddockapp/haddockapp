import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { PrismaService } from '../prisma/prisma.service';
import { VmState } from '../types/vm.enum';
import { VmService } from '../vm/vm.service';
import { GithubSourceSettingsDto } from './dto/settings.dto';
import { PersistedSourceDto } from './dto/source.dto';
import { getSettings } from './utils/get-settings';

@Processor('deploys')
export class DeployConsumer {
  private readonly logger = new Logger(DeployConsumer.name);

  constructor(
    private prisma: PrismaService,
    private vmService: VmService,
  ) {}

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  private async deployGithubSource(
    source: PersistedSourceDto,
  ): Promise<string> {
    const { organization, repository, branch } =
      getSettings<GithubSourceSettingsDto>(source.settings);

    const deployPath = `../workspaces/${source.project?.id}`;

    this.logger.log(
      `Cloning github repository ${organization}/${repository}#${branch} to ${deployPath}`,
    );

    await git.clone({
      fs,
      http,
      url: `https://github.com/${organization}/${repository}.git`,
      dir: deployPath,
      ref: branch,
      singleBranch: true,
      onAuth: () => {
        return {
          username: 'x-access-token',
          password: source.authorization.value,
        };
      },
    });
    return deployPath;
  }

  private getDeployPath(source: PersistedSourceDto): Promise<string> {
    if (source.type === 'github') {
      return this.deployGithubSource(source);
    }
    throw new Error(`Unknown source type ${source.type}`);
  }

  @Process('deploy')
  async deploy(job: Job<PersistedSourceDto>) {
    this.logger.log(`Deploying source for project ${job.data.project.id}`);
    this.vmService.changeVmStatus(job.data.project.vmId, VmState.Starting);

    const source = job.data;

    const deployPath: string = await this.getDeployPath(source);

    await this.prisma.project.update({
      where: {
        id: source.project.id,
      },
      data: {
        path: deployPath,
      },
    });

    this.logger.log(`Setting up VM for project ${source.project.id}`);
    await this.vmService.setVagrantFile(source.project.vmId, deployPath);

    this.logger.log(`Starting VM for project ${source.project.id}`);
    await this.vmService.upVm(source.project.vmId);

    this.logger.log(`Deployed project ${source.project.id}`);
  }
}
