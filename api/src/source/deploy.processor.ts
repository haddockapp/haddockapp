import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { VmState } from '../types/vm.enum';
import { VmService } from '../vm/vm.service';
import { GithubSourceSettingsDto } from './dto/settings.dto';
import { PersistedSourceDto } from './dto/source.dto';
import { getSettings } from './utils/get-settings';
import { DeployError } from './errors/deploy.error';
import { ExecutionError } from 'src/types/error/execution.error';
import { AuthorizationService } from '../authorization/authorization.service';
import { execCommand } from 'src/utils/exec-utils';
import { AuthorizationEnum } from 'src/authorization/types/authorization.enum';
import { join } from 'path';
import { tmpdir } from 'os';
import { ProjectRepository } from 'src/project/project.repository';
import { VmRepository } from 'src/vm/vm.repository';
import { PersistedVmDto } from 'src/vm/dto/vm.dto';
import { ComposeService } from 'src/compose/compose.service';
import { ServiceDto } from 'src/compose/model/Service';

@Processor('deploys')
export class DeployConsumer {
  private readonly logger = new Logger(DeployConsumer.name);

  constructor(
    private readonly vmRepository: VmRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly vmService: VmService,
    private readonly authorizationService: AuthorizationService,
    private readonly composeService: ComposeService,
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
    const repoPath = `${deployPath}/${process.env.SOURCE_DIR || 'source'}`;

    if (fs.existsSync(repoPath)) {
      this.logger.log(
        `Removing existing deployment path ${repoPath} for project ${source.project.id}`,
      );
      fs.rmSync(repoPath, { recursive: true });
    }

    this.logger.log(
      `Cloning github repository ${organization}/${repository}#${branch} to ${repoPath}`,
    );

    const authorizationType: AuthorizationEnum =
      await this.authorizationService.getAuthorizationType(
        source.authorizationId,
      );

    switch (authorizationType) {
      case AuthorizationEnum.DEPLOY_KEY: {
        const tempFilePath = join(tmpdir(), `ssh-key-${Date.now()}`);

        try {
          const key =
            (await this.authorizationService.getAuthorizationKey(
              source.authorizationId,
            )) + '\n';

          fs.writeFileSync(tempFilePath, key, { mode: 0o600 });

          await execCommand(
            `GIT_SSH_COMMAND="ssh -i ${tempFilePath}" git clone git@github.com:${organization}/${repository}.git ${repoPath}`,
          );
        } catch (e) {
          fs.unlinkSync(tempFilePath);

          if (e instanceof ExecutionError) {
            this.logger.error(`Failed to clone repository: ${e.message}`);
          }
          throw new DeployError('Failed to clone repository');
        }

        fs.unlinkSync(tempFilePath);
        break;
      }
      case AuthorizationEnum.OAUTH:
      case AuthorizationEnum.PERSONAL_ACCESS_TOKEN: {
        await git
          .clone({
            fs,
            http,
            url: `https://github.com/${organization}/${repository}.git`,
            dir: repoPath,
            ref: branch,
            singleBranch: true,
            onAuth: () =>
              this.authorizationService.getDeployHeaderForAuthorization(
                source.authorizationId,
              ),
            onAuthFailure: () => {
              throw new DeployError('Failed to authenticate with github');
            },
          })
          .catch((err) => {
            this.logger.error(`Failed to clone repository: ${err.message}`);
            throw new DeployError('Failed to clone repository');
          });
      }
    }
    return deployPath;
  }

  private getDeployPath(source: PersistedSourceDto): Promise<string> {
    if (source.type === 'github') {
      return this.deployGithubSource(source);
    }
    throw new Error(`Unknown source type ${source.type}`);
  }

  private getComposePath(source: PersistedSourceDto): string {
    switch (source.type) {
      case 'github': {
        const settings = getSettings<GithubSourceSettingsDto>(source.settings);
        return `./${process.env.SOURCE_DIR}/${settings.composePath}`;
      }
      default:
        throw new Error(`Unknown source type ${source.type}`);
    }
  }

  private async handleProjectServices(
    projectId: string,
    source: PersistedSourceDto,
  ) {
    const composePath: string = this.getComposePath(source);

    const rawCompose = this.composeService.readComposeFile(
      projectId,
      composePath,
    );
    if (!rawCompose) {
      return;
    }

    const services: ServiceDto[] = this.composeService.parseServices(
      rawCompose.toString(),
    );

    await this.projectRepository.setServicesToProject(projectId, services);

    this.logger.log(`Added services to project ${projectId}`);
  }

  @Process('deploy')
  async deploy(job: Job<PersistedSourceDto>) {
    this.logger.log(`Deploying source for project ${job.data.project.id}`);

    const source = job.data;

    try {
      const deployPath: string = await this.getDeployPath(source);

      await this.projectRepository.updateProject({
        where: { id: source.project.id },
        data: {
          path: deployPath,
        },
      });

      await this.handleProjectServices(source.project.id, source);

      this.logger.log(`Setting up VM for project ${source.project.id}`);
      await this.vmService.createVM(source.project.vmId, deployPath);

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

      const vm: PersistedVmDto = await this.vmRepository.getVm({
        id: source.project.vmId,
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
