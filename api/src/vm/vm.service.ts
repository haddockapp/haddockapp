import { Inject, Injectable, Logger } from '@nestjs/common';
import { Vm } from '@prisma/client';
import { VmRepository } from './vm.repository';
import { VmState } from 'src/types/vm.enum';
import { WebSocketService } from '../websockets/websocket.service';
import { EventScope, EventType } from '../websockets/dto/websocket-event.dto';
import { NetworksService } from 'src/networks/networks.service';
import { PersistedVmDto } from './dto/vm.dto';
import { IVMManager } from 'src/vm-manager/types/ivm.manager';

@Injectable()
export class VmService {
  private readonly logger = new Logger(VmService.name);

  constructor(
    private readonly vmRepository: VmRepository,
    private readonly websocketService: WebSocketService,
    private readonly networkService: NetworksService,
    @Inject('IVM_MANAGER') private readonly vmManager: IVMManager,
  ) {}

  async changeVmStatus(vmId: string, status: VmState): Promise<void> {
    await this.vmRepository.updateVm({
      where: { id: vmId },
      data: { status },
    });

    const vm: PersistedVmDto = await this.vmRepository.getVm({ id: vmId });

    this.websocketService.notifyAll({
      scope: EventScope.PROJECT,
      event: EventType.STATUS_CHANGE,
      target: vm.project.id,
      data: {
        status: vm.status,
      },
    });
  }

  async createVM(vmId: string, deployPath: string): Promise<Vm> {
    const vm: PersistedVmDto = await this.vmRepository.getVm({ id: vmId });

    return this.vmManager.createVM(vm, deployPath);
  }

  async upVm(vmId: string, force: boolean = false): Promise<void> {
    const vm: PersistedVmDto = await this.vmRepository.getVm({ id: vmId });

    if (
      !force &&
      (vm.status === VmState.Running || vm.status === VmState.Starting)
    ) {
      throw new Error('VM is already running');
    }

    await this.changeVmStatus(vm.id, VmState.Starting);

    const upVM: Vm = await this.vmManager.startVM(vm, force);

    await this.vmRepository.updateVm({
      where: { id: vm.id },
      data: { ...upVM },
    });

    await this.networkService.updateNetworksfile();

    await this.changeVmStatus(vm.id, VmState.Running);

    this.logger.log(`VM ${vm.id} is running on IP ${vm.ip || upVM.ip}`);
  }

  async downVm(vmId: string, force: boolean = false): Promise<void> {
    const vm: PersistedVmDto = await this.vmRepository.getVm({ id: vmId });

    if (!force && vm.status === VmState.Stopped) {
      throw new Error('VM is already stopped');
    }

    await this.changeVmStatus(vm.id, VmState.Stopping);

    await this.vmManager.stopVM(vm);

    await this.changeVmStatus(vm.id, VmState.Stopped);

    this.logger.log(`VM ${vm.id} stopped`);
  }

  async restartVm(vmId: string): Promise<void> {
    const vm: PersistedVmDto = await this.vmRepository.getVm({ id: vmId });

    if (vm.status === VmState.Stopped) {
      throw new Error('VM is stopped');
    }

    await this.changeVmStatus(vm.id, VmState.Starting);

    const restartedVM: Vm = await this.vmManager.restartVM(vm);

    await this.vmRepository.updateVm({
      where: { id: vm.id },
      data: { ...restartedVM },
    });

    await this.changeVmStatus(vm.id, VmState.Running);

    this.logger.log(`VM ${vm.id} restarted`);
  }

  async deletePhisicalVm(vmId: string): Promise<void> {
    const vm: PersistedVmDto = await this.vmRepository.getVm({ id: vmId });

    if (vm.status === VmState.Starting) {
      throw new Error('VM is starting');
    }

    try {
      await this.vmManager.destroyVM(vm);

      this.logger.log(`VM ${vm.id} destroyed`);
    } catch (e) {}
  }

  async deleteVmDb(vmId: string): Promise<void> {
    this.vmRepository.deleteVm({ id: vmId });
  }
}
