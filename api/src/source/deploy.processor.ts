import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { VmState } from '../types/vm.enum';
import { VmService } from '../vm/vm.service';
import {
  GithubSourceSettingsDto,
  TemplateSourceSettingsDto,
  ZipUploadSourceSettingsDto,
} from './dto/settings.dto';
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
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { SourceType } from './dto/create-source.dto';
import { SourceService } from './source.service';
import * as unzipper from 'unzipper';
import { Version } from 'src/templates/types/template.type';

@Processor('deploys')
export class DeployConsumer {
  private readonly logger = new Logger(DeployConsumer.name);

  constructor(
    private readonly vmRepository: VmRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly vmService: VmService,
    private readonly authorizationService: AuthorizationService,
    private readonly composeService: ComposeService,
    private readonly sourceService: SourceService,
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

    const authorizationType: AuthorizationEnum = source.authorizationId
      ? await this.authorizationService.getAuthorizationType(
          source.authorizationId,
        )
      : AuthorizationEnum.NONE;

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
            `GIT_SSH_COMMAND="ssh -i ${tempFilePath}" git clone -b ${branch} git@github.com:${organization}/${repository}.git ${repoPath}`,
          );
        } catch (e) {
          fs.unlinkSync(tempFilePath);

          if (e instanceof ExecutionError) {
            throw new DeployError('Failed to clone repository', [
              e.stdout,
              e.stderr,
            ]);
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
            throw new DeployError('Failed to clone repository', [err.message]);
          });
        break;
      }
      case AuthorizationEnum.NONE: {
        await git
          .clone({
            fs,
            http,
            url: `https://github.com/${organization}/${repository}.git`,
            dir: repoPath,
            ref: branch,
            singleBranch: true,
          })
          .catch((err) => {
            throw new DeployError('Failed to clone repository', [err.message]);
          });
        break;
      }
    }
    return deployPath;
  }

  private async deployZipUploadSource(
    source: PersistedSourceDto,
  ): Promise<string> {
    const settings = getSettings<ZipUploadSourceSettingsDto>(source.settings);
    const deployPath = `../workspaces/${source.project?.id}`;
    const extractPath = `${deployPath}/${process.env.SOURCE_DIR || 'source'}`;

    if (settings.status === 'none') {
      throw new DeployError('No zip upload found for deployment');
    }

    if (settings.status === 'deployed') {
      return deployPath;
    }

    const zipPath = `../uploads/${source.project?.id}.zip`;

    if (fs.existsSync(extractPath)) {
      this.logger.log(
        `Removing existing deployment path ${extractPath} for project ${source.project.id}`,
      );
      fs.rmSync(extractPath, { recursive: true });
    }

    this.logger.log(
      `Deploying zip upload source for project ${source.project.id} to ${extractPath}...`,
    );

    try {
      await fs
        .createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .promise();

      // Update settings only after successful unzip
      await this.sourceService.updateSourceSettings(source.id, {
        ...settings,
        status: 'deployed',
      });
    } catch (err) {
      throw new DeployError(`Failed to unzip project source: ${err.message}`);
    }

    await this.sourceService.updateSourceSettings(source.id, {
      ...settings,
      status: 'deployed',
    });

    return deployPath;
  }

  private async deployTemplateSource(
    source: PersistedSourceDto,
  ): Promise<string> {
    const deployPath = `../workspaces/${source.project?.id}`;
    const repoPath = `${deployPath}/${process.env.SOURCE_DIR || 'source'}`;

    if (fs.existsSync(repoPath)) {
      this.logger.log(
        `Removing existing deployment path ${repoPath} for project ${source.project.id}`,
      );
      fs.rmSync(repoPath, { recursive: true });
    }

    this.logger.log(
      `Deploying template source for project ${source.project.id} to ${repoPath}`,
    );

    const settings = getSettings<TemplateSourceSettingsDto>(source.settings);

    const version = JSON.parse(settings.version) as Version;

    await git
      .clone({
        fs,
        http,
        url: `https://github.com/haddockapp/templates/.git`,
        dir: repoPath,
        gitdir: `${version.path}`,
        singleBranch: true,
      })
      .catch((err) => {
        throw new DeployError('Failed to clone repository', [err.message]);
      });

    return deployPath;
  }

  private getDeployPath(source: PersistedSourceDto): Promise<string> {
    switch (source.type) {
      case SourceType.GITHUB:
        return this.deployGithubSource(source);
      case SourceType.ZIP_UPLOAD: {
        return this.deployZipUploadSource(source);
      }
      case SourceType.TEMPLATE: {
        return this.deployTemplateSource(source);
      }
      default:
        throw new Error(`Unknown source type ${source.type}`);
    }
  }

  private getComposePath(source: PersistedSourceDto): string {
    switch (source.type) {
      case SourceType.GITHUB: {
        const settings = getSettings<GithubSourceSettingsDto>(source.settings);
        return `./${process.env.SOURCE_DIR}/${settings.composePath}`;
      }
      case SourceType.ZIP_UPLOAD: {
        const settings = getSettings<ZipUploadSourceSettingsDto>(
          source.settings,
        );
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
  async deploy(
    job: Job<{ source: PersistedSourceDto; startAfterDeploy: boolean }>,
  ) {
    const { source, startAfterDeploy } = job.data;
    this.logger.log(`Deploying source for project ${source.project.id}`);

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

      if (startAfterDeploy) {
        this.logger.log(`Starting VM for project ${source.project.id}`);
        await this.vmService.upVm(source.project.vmId);
      }

      this.logger.log(`Deployed project ${source.project.id}`);
    } catch (e) {
      const logs: string[] = [];
      if (e instanceof DeployError) {
        this.logger.error(`Failed to deploy source: ${e.message}`, e.logs);
        e.logs.forEach((log) => logs.push(log));
      } else if (e instanceof ExecutionError) {
        this.logger.error(
          `Failed to execute command: ${e.message}`,
          e.stdout,
          e.stderr,
        );
        logs.push(e.stdout, e.stderr);
      } else {
        this.logger.error(`Unexpected error: ${e.message}`);
        logs.push(e.message);
      }

      const vm: PersistedVmDto = await this.vmRepository.getVm({
        id: source.project.vmId,
      });

      if (vm.status === VmState.Starting || vm.status === VmState.Running) {
        try {
          await this.vmService.downVm(source.project.vmId);
        } catch (e) {
          if (e instanceof ExecutionError) {
            this.logger.error(
              `Failed to stop vm: ${e.message}`,
              e.stdout,
              e.stderr,
            );
          }
        }
      }
      await this.vmService.changeVmStatus(source.project.vmId, VmState.Error, {
        logs: logs,
      });
      return;
    }
  }

  @Process('start')
  async start(job: Job<PersistedProjectDto>) {
    const project = job.data;

    this.logger.log(`Starting project ${project.id}`);
    try {
      await this.vmService.upVm(project.vmId);
    } catch (e) {
      const logs: string[] = [];
      if (e instanceof ExecutionError) {
        this.logger.error(
          `Failed to start vm: ${e.message}`,
          e.stdout,
          e.stderr,
        );
        logs.push(e.stdout, e.stderr);
      } else {
        logs.push(e.message);
      }
      await this.vmService.changeVmStatus(project.vmId, VmState.Error, {
        logs: logs,
      });
    }
  }

  @Process('stop')
  async stop(job: Job<PersistedProjectDto>) {
    const project = job.data;

    this.logger.log(`Stopping project ${project.id}`);
    try {
      await this.vmService.downVm(project.vmId);
    } catch (e) {
      const logs: string[] = [];
      if (e instanceof ExecutionError) {
        this.logger.error(
          `Failed to stop vm: ${e.message}`,
          e.stdout,
          e.stderr,
        );
        logs.push(e.stdout, e.stderr);
      } else {
        logs.push(e.message);
      }
      await this.vmService.changeVmStatus(project.vmId, VmState.Error, {
        logs: logs,
      });
    }
  }
}
