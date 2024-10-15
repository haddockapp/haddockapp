import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { exec } from 'child_process';
import { Prisma, Vm } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { VmRepository } from './vm.repository';
import { VmState } from 'src/types/vm.enum';
import { WebSocketService } from '../websockets/websocket.service';
import { EventScope, EventType } from '../websockets/dto/websocket-event.dto';

@Injectable()
export class VmService {
  private readonly template: HandlebarsTemplateDelegate<any>;

  constructor(
    private readonly vmRepository: VmRepository,
    private readonly websocketService: WebSocketService,
  ) {
    this.template = compile(
      readFileSync('./src/vm/template/Vagrantfile.hbs', 'utf-8'),
    );
  }

  async changeVmStatus(vmId: string, status: VmState): Promise<void> {
    await this.vmRepository.updateVm({
      where: { id: vmId },
      data: { status },
    });

    const vm = await this.vmRepository.getVmAndProject({ id: vmId });

    this.websocketService.notifyAll({
      scope: EventScope.PROJECT,
      event: EventType.STATUS_CHANGE,
      target: vm.project.id,
      data: {
        status: vm.status,
      },
    });
  }

  private async execCommand(command: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      });
    });
    return promise;
  }

  private getIpFromOutput(output: string): string {
    const sshAddressRegex = /SSH address: (\S+:\d+)/;
    const match = RegExp(sshAddressRegex).exec(output);

    if (match) {
      return match[1].split(':')[0];
    }
    return '';
  }

  async setVagrantFile(vmId: string, deployPath: string): Promise<Vm> {
    const vm = await this.vmRepository.getVm({ id: vmId });

    const template: string = this.template(vm);

    await writeFile(`${deployPath}/Vagrantfile`, template, {
      encoding: 'utf-8',
    });

    return vm;
  }

  async upVm(vmId: string): Promise<void> {
    const vm: Prisma.VmGetPayload<{
      include: {
        project: true;
      };
    }> = await this.vmRepository.getVmAndProject({ id: vmId });

    if (vm.status === VmState.Running) {
      throw new Error('VM is already running');
    }

    await this.changeVmStatus(vm.id, VmState.Starting);

    const output = await this.execCommand(
      `cd ${vm.project.path} && vagrant up`,
    );

    await this.execCommand(
      `cd ${vm.project.path} && vagrant ssh -c "cd service && docker-compose up --build -d"`,
    );

    const ip = this.getIpFromOutput(output);

    await this.vmRepository.updateVm({
      where: { id: vm.id },
      data: { ip },
    });

    await this.changeVmStatus(vm.id, VmState.Running);
  }

  async downVm(vmId: string): Promise<void> {
    const vm: Prisma.VmGetPayload<{
      include: {
        project: true;
      };
    }> = await this.vmRepository.getVmAndProject({ id: vmId });

    if (vm.status === VmState.Running) {
      throw new Error('VM is already running');
    }

    await this.execCommand(`cd ${vm.project.path} && vagrant halt`);

    await this.changeVmStatus(vm.id, VmState.Stopped);
  }

  async restartVm(vmId: string): Promise<void> {
    const vm: Prisma.VmGetPayload<{
      include: {
        project: true;
      };
    }> = await this.vmRepository.getVmAndProject({ id: vmId });

    if (vm.status === VmState.Stopped) {
      throw new Error('VM is stopped');
    }

    await this.changeVmStatus(vm.id, VmState.Starting);

    const output = await this.execCommand(
      `cd ${vm.project.path} && vagrant reload`,
    );

    const ip = this.getIpFromOutput(output);

    await this.vmRepository.updateVm({
      where: { id: vm.id },
      data: { ip },
    });

    await this.changeVmStatus(vm.id, VmState.Running);
  }

  async deletePhisicalVm(vmId: string): Promise<void> {
    const vm = await this.vmRepository.getVmAndProject({ id: vmId });

    if (vm.status === VmState.Starting) {
      throw new Error('VM is starting');
    }

    await this.execCommand(`cd ${vm.project.path} && vagrant destroy -f`);
  }

  async deleteVmDb(vmId: string): Promise<void> {
    this.vmRepository.deleteVm({ id: vmId });
  }
}
