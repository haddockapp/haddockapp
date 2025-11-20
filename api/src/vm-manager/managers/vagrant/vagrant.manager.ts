import { Injectable, Logger } from '@nestjs/common';
import { IVMManager, UpdatedVm } from '../../types/ivm.manager';
import { Project, Source, Vm } from '@prisma/client';
import { execCommand, ExecResult } from 'src/utils/exec-utils';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { PersistedVmDto } from 'src/vm/dto/vm.dto';
import { getSettings } from 'src/source/utils/get-settings';
import {
  GithubSourceSettingsDto,
  TemplateSourceSettingsDto,
  ZipUploadSourceSettingsDto,
} from 'src/source/dto/settings.dto';
import { EnvironmentVar } from 'src/project/dto/environmentVar';
import { ExecutionError } from 'src/types/error/execution.error';
import { SourceType } from 'src/source/dto/create-source.dto';

@Injectable()
export class VagrantManager implements IVMManager {
  private readonly template: HandlebarsTemplateDelegate<any>;
  private readonly logger = new Logger(VagrantManager.name);

  constructor() {
    this.template = compile(
      readFileSync(
        './src/vm-manager/managers/vagrant/template/Vagrantfile.hbs',
        'utf-8',
      ),
    );
  }

  private getIpFromOutput(output: string): string | undefined {
    const sshAddressRegex = /SSH address: (\S+:\d+)/;
    const match = RegExp(sshAddressRegex).exec(output);

    if (match) {
      return match[1].split(':')[0];
    }
    return undefined;
  }

  private getComposePath(source: Source): string {
    switch (source.type) {
      case SourceType.GITHUB: {
        const settings = getSettings<GithubSourceSettingsDto>(source.settings);
        if (settings.composePath === undefined || !settings.composePath) {
          throw new Error('Compose path not set');
        }
        return settings.composePath;
      }
      case SourceType.ZIP_UPLOAD: {
        const settings = getSettings<ZipUploadSourceSettingsDto>(
          source.settings,
        );
        if (settings.composePath === undefined || !settings.composePath) {
          throw new Error('Compose path not set');
        }
        return settings.composePath;
      }
      case SourceType.TEMPLATE: {
        const settings = getSettings<TemplateSourceSettingsDto>(
          source.settings,
        );
        if (settings.composePath === undefined || !settings.composePath) {
          throw new Error('Compose path not set');
        }
        return settings.composePath;
      }
      default:
        throw new Error('Invalid source type');
    }
  }

  private async runSource(
    project: Project,
    source: Source,
  ): Promise<ExecResult> {
    switch (source.type) {
      case SourceType.GITHUB:
      case SourceType.TEMPLATE:
      case SourceType.ZIP_UPLOAD: {
        const composePath = this.getComposePath(source);
        const envArgs = project.environmentVars
          .flatMap((envVar: EnvironmentVar) => [
            `${envVar.key}="${envVar.value}"`,
          ])
          .join(' ');

        const res = await execCommand(
          `cd ${project.path} && vagrant ssh -c 'cd source && ${envArgs} docker compose -f ${composePath} up --build -d'`,
        );
        this.logger.log(
          `Source ${source.id} of type ${source.type} deployed for Vm ${project.vmId}`,
        );
        return res;
      }
      default:
        this.logger.error(`Source type ${source.type} not supported for Vm ${project.vmId}`);
        throw new Error('Invalid source type');
    }
  }

  async createVM(vm: PersistedVmDto, deployPath: string): Promise<UpdatedVm> {
    const composePath = this.getComposePath(vm.project.source);

    const template: string = this.template({
      ...vm,
      source_dir: process.env.SOURCE_DIR || 'source',
      name: vm.project.id,
      compose_path: composePath,
    });

    await writeFile(`${deployPath}/Vagrantfile`, template, {
      encoding: 'utf-8',
    });

    this.logger.log(`Vagrantfile created for VM ${vm.id}`);

    return {
      vm,
      logs: {
        stdout: `Vagrantfile ${deployPath}/Vagrantfile created.`,
        stderr: '',
      },
    };
  }

  async destroyVM(vm: PersistedVmDto): Promise<UpdatedVm> {
    const result = await execCommand(
      `cd ${vm.project.path} && vagrant destroy -f`,
    );

    this.logger.log(`VM ${vm.id} destroyed`);

    return { vm, logs: result };
  }

  async startVM(
    vm: PersistedVmDto,
    force: boolean = false,
  ): Promise<UpdatedVm> {
    const output = await execCommand(`cd ${vm.project.path} && vagrant up`);

    const sourceRes = await this.runSource(vm.project, vm.project.source);

    output.stdout += '\n' + sourceRes.stdout;
    output.stderr += '\n' + sourceRes.stderr;

    const ip = this.getIpFromOutput(output.stdout);

    if (
      !(force && (ip !== undefined || ip !== '' || ip !== null)) &&
      ip === undefined
    ) {
      throw new ExecutionError(output.stdout, output.stderr);
    }

    this.logger.log(`VM ${vm.id} is running on IP ${ip || vm.ip}`);

    vm.ip = ip || vm.ip;

    return { vm, logs: output };
  }

  async stopVM(vm: PersistedVmDto): Promise<UpdatedVm> {
    const result = await execCommand(`cd ${vm.project.path} && vagrant halt`);

    this.logger.log(`VM ${vm.id} stopped`);

    return { vm, logs: result };
  }

  async restartVM(vm: PersistedVmDto): Promise<UpdatedVm> {
    const output = await execCommand(`cd ${vm.project.path} && vagrant reload`);

    const sourceRes = await this.runSource(vm.project, vm.project.source);

    output.stdout += '\n' + sourceRes.stdout;
    output.stderr += '\n' + sourceRes.stderr;

    const ip = this.getIpFromOutput(output.stdout);

    if (!(ip !== undefined || ip !== '' || ip !== null) && ip === undefined) {
      throw new ExecutionError(output.stdout, output.stderr);
    }

    vm.ip = ip || vm.ip;

    this.logger.log(`VM ${vm.id} restarted on IP ${ip || vm.ip}`);

    return { vm, logs: output };
  }

  async executeCommand(
    vm: PersistedVmDto,
    command: string,
  ): Promise<ExecResult> {
    const output = await execCommand(
      `cd ${vm.project.path} && vagrant ssh -c "${command}"`,
    );

    this.logger.log(`Command executed on VM ${vm.id}: ${command}`);

    return output;
  }
}
