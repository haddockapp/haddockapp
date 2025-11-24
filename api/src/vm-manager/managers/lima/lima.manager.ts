import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { compile } from 'handlebars';
import * as path from 'path';
import { EnvironmentVar } from 'src/project/dto/environmentVar';
import { GithubSourceSettingsDto } from 'src/source/dto/settings.dto';
import { getSettings } from 'src/source/utils/get-settings';
import { ExecutionError } from 'src/types/error/execution.error';
import { execCommand, ExecResult } from 'src/utils/exec-utils';
import { PersistedVmDto } from 'src/vm/dto/vm.dto';
import { IVMManager, UpdatedVm } from '../../types/ivm.manager';

@Injectable()
export class LimaManager implements IVMManager {
  private readonly template: HandlebarsTemplateDelegate<any>;
  private readonly logger = new Logger(LimaManager.name);

  constructor() {
    this.template = compile(
      readFileSync(
        './src/vm-manager/managers/lima/template/lima.yaml.hbs',
        'utf-8',
      ),
    );
  }

  private getComposePath(vm: PersistedVmDto): string {
    const settings = getSettings<GithubSourceSettingsDto>(
      vm.project.source.settings,
    );
    if (!settings.composePath) throw new Error('Compose path missing');
    return settings.composePath;
  }

  private getInstanceName(vm: PersistedVmDto): string {
    return `vm-${vm.project.id}`;
  }

  private async runCompose(vm: PersistedVmDto): Promise<ExecResult> {
    const instance = this.getInstanceName(vm);
    const composePath = this.getComposePath(vm);

    const envArgs = (vm.project.environmentVars || [])
      .map((e: EnvironmentVar) => `${e.key}="${e.value}"`)
      .join(' ');

    const cmd = `${envArgs} sudo docker compose -f ${composePath} up --build -d`.replace(/\n/g, ' ');

    return execCommand(`limactl shell --workdir="/workspace/source" ${instance} bash -c "${cmd}"`);
  }

  // ---------------------------
  // CREATE VM
  // ---------------------------
  async createVM(vm: PersistedVmDto, deployPath: string): Promise<UpdatedVm> {
    const instance = this.getInstanceName(vm);

    const yaml = this.template({
      name: instance,
      project_path: path.resolve(`${vm.project.path}/${process.env.SOURCE_DIR || 'source'}`),
      absoluteRoot: path.resolve(vm.project.path, '..', '..'),
      cpus: vm.cpus,
      ram: vm.memory,
      disk: vm.disk,
    });

    const yamlPath = `${deployPath}/lima-${instance}.yaml`;

    await writeFile(yamlPath, yaml, { encoding: 'utf-8' });

    this.logger.log(`lima.yaml created for VM ${vm.id}`);

    return {
      vm,
      logs: {
        stdout: `Lima YAML generated at ${yamlPath}`,
        stderr: '',
      },
    };
  }

  // ---------------------------
  // START VM
  // ---------------------------
  async startVM(vm: PersistedVmDto, force = false): Promise<UpdatedVm> {
    const instance = this.getInstanceName(vm);
    const deployPath = vm.project.path;
    const yamlPath = `${deployPath}/lima-${instance}.yaml`;

    const result = await execCommand(`limactl start --name ${instance} ${yamlPath}`);

    const composeRes = await this.runCompose(vm);

    result.stdout += '\n' + composeRes.stdout;
    result.stderr += '\n' + composeRes.stderr;

    // -- Fetch IP
    const { stdout: ip } = await execCommand(`limactl shell --workdir="/workspace/source" ${instance} ip -o -4 addr show dev lima0 | awk '{print $4}'`);

    const ipMatch = ip.match(/(\d{1,3}\.){3}\d{1,3}/);
    const extractedIp = ipMatch ? ipMatch[0] : null;

    if (!force && !extractedIp) {
      throw new ExecutionError(result.stdout, result.stderr);
    }

    vm.ip = extractedIp || vm.ip;

    this.logger.log(`VM ${vm.id} running at IP ${vm.ip}`);

    return { vm, logs: result };
  }

  // ---------------------------
  // STOP VM
  // ---------------------------
  async stopVM(vm: PersistedVmDto): Promise<UpdatedVm> {
    const instance = this.getInstanceName(vm);
    const result = await execCommand(`limactl stop ${instance}`);
    this.logger.log(`VM ${vm.id} stopped`);
    return { vm, logs: result };
  }

  // ---------------------------
  // RESTART VM
  // ---------------------------
  async restartVM(vm: PersistedVmDto): Promise<UpdatedVm> {
    const instance = this.getInstanceName(vm);

    // Stop result (ExecResult)
    const stopRes = await execCommand(`limactl stop ${instance}`);

    // Start VM (UpdatedVm)
    const startRes = await this.startVM(vm, true);

    // Merge logs: stop stdout/stderr + start stdout/stderr
    const mergedLogs: ExecResult = {
      stdout: stopRes.stdout + '\n' + startRes.logs.stdout,
      stderr: stopRes.stderr + '\n' + startRes.logs.stderr,
    };

    return {
      vm: startRes.vm,
      logs: mergedLogs,
    };
  }

  // ---------------------------
  // DESTROY VM
  // ---------------------------
  async destroyVM(vm: PersistedVmDto): Promise<UpdatedVm> {
    const instance = this.getInstanceName(vm);
    const result = await execCommand(`limactl delete ${instance} --force`);
    this.logger.log(`VM ${vm.id} destroyed`);
    return { vm, logs: result };
  }

  // ---------------------------
  // EXEC COMMAND
  // ---------------------------
  async executeCommand(vm: PersistedVmDto, command: string): Promise<ExecResult> {
    const instance = this.getInstanceName(vm);
    const result = await execCommand(`limactl shell ${instance} bash -c "${command}"`);

    this.logger.log(`Command executed on VM ${vm.id}: ${command}`);
    return result;
  }
}
