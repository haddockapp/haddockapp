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
import { DeployError } from './errors/deploy.error';
import { ExecutionError } from 'src/types/error/execution.error';
import { AuthorizationService } from '../authorization/authorization.service';

@Processor('deploys')
export class DeployConsumer {
  private readonly logger = new Logger(DeployConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vmService: VmService,
    private readonly authorizationService: AuthorizationService
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

    await git
      .clone({
        fs,
        http,
        url: `https://github.com/${organization}/${repository}.git`,
        dir: deployPath,
        ref: branch,
        singleBranch: true,
        onAuth: () => this.authorizationService.getDeployHeaderForAuthorization(source.authorizationId),
        onAuthFailure: () => {
          throw new DeployError('Failed to authenticate with github');
        },
      })
      .catch((err) => {
        this.logger.error(`Failed to clone repository: ${err.message}`);
        throw new DeployError('Failed to clone repository');
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

    const source = job.data;

    try {
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
    } catch (e) {
      if (e instanceof DeployError) {
        this.logger.error(`Failed to deploy source: ${e.message}`);
      } else if (e instanceof ExecutionError) {
        this.logger.error(`Failed to execute command: ${e.message}`);
      } else {
        this.logger.error(`Unexpected error: ${e.message}`);
      }
      const vm = await this.prisma.vm.findUnique({
        where: {
          id: source.project.vmId,
        },
      });
      if (vm.status === VmState.Starting || vm.status === VmState.Running) {
        try {
          await this.vmService.downVm(source.project.vmId);
        } catch (e) {
          if (e instanceof ExecutionError) {
            this.logger.error(`Failed to stop vm: ${e.message}`);
          }
        }
      }
      await this.vmService.changeVmStatus(source.project.vmId, VmState.Error);
      return;
    }
  }
}
