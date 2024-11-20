import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { Prisma, Vm } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { VmRepository } from './vm.repository';
import { VmState } from 'src/types/vm.enum';
import { WebSocketService } from '../websockets/websocket.service';
import { EventScope, EventType } from '../websockets/dto/websocket-event.dto';
import { NetworksService } from 'src/networks/networks.service';
import { execCommand } from 'src/utils/exec-utils';

@Injectable()
export class VmService {
  private readonly template: HandlebarsTemplateDelegate<any>;
  private readonly logger = new Logger(VmService.name);

  constructor(
    private readonly vmRepository: VmRepository,
    private readonly websocketService: WebSocketService,
    private readonly networkService: NetworksService,
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

  private getIpFromOutput(output: string): string | undefined {
    const sshAddressRegex = /SSH address: (\S+:\d+)/;
    const match = RegExp(sshAddressRegex).exec(output);

    if (match) {
      return match[1].split(':')[0];
    }
    return undefined;
  }

  async setVagrantFile(vmId: string, deployPath: string): Promise<Vm> {
    const vm = await this.vmRepository.getVm({ id: vmId });

    const template: string = this.template(vm);

    await writeFile(`${deployPath}/Vagrantfile`, template, {
      encoding: 'utf-8',
    });

    return vm;
  }

  async upVm(vmId: string, force: boolean = false): Promise<void> {
    const vm: Prisma.VmGetPayload<{
      include: {
        project: true;
      };
    }> = await this.vmRepository.getVmAndProject({ id: vmId });

    if (
      !force &&
      (vm.status === VmState.Running || vm.status === VmState.Starting)
    ) {
      throw new Error('VM is already running');
    }

    await this.changeVmStatus(vm.id, VmState.Starting);

    const output = await execCommand(`cd ${vm.project.path} && vagrant up`);

    await execCommand(
      `cd ${vm.project.path} && vagrant ssh -c "cd service && docker-compose up --build -d"`,
    );

    const ip = this.getIpFromOutput(output);

    if (
      !(force && (vm.ip !== undefined || vm.ip !== '' || vm.ip !== null)) &&
      ip === undefined
    ) {
      throw new Error('Failed to get IP address');
    }

    await this.vmRepository.updateVm({
      where: { id: vm.id },
      data: { ip },
    });

    await this.networkService.updateNetworksfile();

    await this.changeVmStatus(vm.id, VmState.Running);

    this.logger.log(`VM ${vm.id} is running on IP ${ip || vm.ip}`);
  }

  async downVm(vmId: string, force: boolean = false): Promise<void> {
    const vm: Prisma.VmGetPayload<{
      include: {
        project: true;
      };
    }> = await this.vmRepository.getVmAndProject({ id: vmId });

    if (!force && vm.status === VmState.Stopped) {
      throw new Error('VM is already stopped');
    }

    await execCommand(`cd ${vm.project.path} && vagrant halt`);

    await this.changeVmStatus(vm.id, VmState.Stopped);

    this.logger.log(`VM ${vm.id} stopped`);
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

    const output = await execCommand(`cd ${vm.project.path} && vagrant reload`);

    const ip = this.getIpFromOutput(output);

    await this.vmRepository.updateVm({
      where: { id: vm.id },
      data: { ip },
    });

    await this.changeVmStatus(vm.id, VmState.Running);

    this.logger.log(`VM ${vm.id} restarted`);
  }

  async deletePhisicalVm(vmId: string): Promise<void> {
    const vm = await this.vmRepository.getVmAndProject({ id: vmId });

    if (vm.status === VmState.Starting) {
      throw new Error('VM is starting');
    }

    try {
      await execCommand(`cd ${vm.project.path} && vagrant destroy -f`);
      this.logger.log(`VM ${vm.id} destroyed`);
    } catch (e) {}
  }

  async deleteVmDb(vmId: string): Promise<void> {
    this.vmRepository.deleteVm({ id: vmId });
  }
}
