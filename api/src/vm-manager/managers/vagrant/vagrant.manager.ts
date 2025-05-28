import { Injectable, Logger } from '@nestjs/common';
import { IVMManager } from '../../types/ivm.manager';
import { Project, Source, Vm } from '@prisma/client';
import { execCommand } from 'src/utils/exec-utils';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { PersistedVmDto } from 'src/vm/dto/vm.dto';
import { getSettings } from 'src/source/utils/get-settings';
import { GithubSourceSettingsDto } from 'src/source/dto/settings.dto';
import { EnvironmentVar } from 'src/project/dto/environmentVar';

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
      case 'github': {
        const settings = getSettings<GithubSourceSettingsDto>(source.settings);
        if (settings.composePath === undefined || !settings.composePath) {
          throw new Error('Compose path not set');
        }
        return settings.composePath;
      }
      default:
        throw new Error('Invalid source type');
    }
  }

  private async runSource(project: Project, source: Source): Promise<void> {
    switch (source.type) {
      case 'github': {
        const composePath = this.getComposePath(source);
        const envArgs = project.environmentVars
          .flatMap((envVar: EnvironmentVar) => [
            `${envVar.key}="${envVar.value}"`,
          ])
          .join(' ');

        await execCommand(
          `cd ${project.path} && vagrant ssh -c 'cd source && ${envArgs} docker-compose -f ${composePath} up --build -d'`,
        );
        break;
      }
      default:
        throw new Error('Invalid source type');
    }
    this.logger.log(
      `Source ${source.id} of type ${source.type} deployed for Vm ${project.vmId}`,
    );
  }

  async createVM(vm: PersistedVmDto, deployPath: string): Promise<Vm> {
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

    return vm;
  }

  async destroyVM(vm: PersistedVmDto): Promise<Vm> {
    await execCommand(`cd ${vm.project.path} && vagrant destroy -f`);

    this.logger.log(`VM ${vm.id} destroyed`);

    return vm;
  }

  async startVM(vm: PersistedVmDto, force: boolean = false): Promise<Vm> {
    const output = await execCommand(`cd ${vm.project.path} && vagrant up`);

    await this.runSource(vm.project, vm.project.source);

    const ip = this.getIpFromOutput(output);

    if (
      !(force && (ip !== undefined || ip !== '' || ip !== null)) &&
      ip === undefined
    ) {
      throw new Error('Failed to get IP address');
    }

    this.logger.log(`VM ${vm.id} is running on IP ${ip || vm.ip}`);

    vm.ip = ip || vm.ip;

    return vm;
  }

  async stopVM(vm: PersistedVmDto): Promise<Vm> {
    await execCommand(`cd ${vm.project.path} && vagrant halt`);

    this.logger.log(`VM ${vm.id} stopped`);

    return vm;
  }

  async restartVM(vm: PersistedVmDto): Promise<Vm> {
    const output = await execCommand(`cd ${vm.project.path} && vagrant reload`);

    await this.runSource(vm.project, vm.project.source);

    const ip = this.getIpFromOutput(output);

    if (!(ip !== undefined || ip !== '' || ip !== null) && ip === undefined) {
      throw new Error('Failed to get IP address');
    }

    vm.ip = ip || vm.ip;

    this.logger.log(`VM ${vm.id} restarted on IP ${ip || vm.ip}`);

    return vm;
  }

  async executeCommand(vm: PersistedVmDto, command: string): Promise<string> {
    const output = await execCommand(
      `cd ${vm.project.path} && vagrant ssh -c "${command}"`,
    );

    this.logger.log(`Command executed on VM ${vm.id}: ${command}`);

    return output;
  }
}
