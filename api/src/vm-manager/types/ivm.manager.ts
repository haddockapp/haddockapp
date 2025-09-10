import { Vm } from '@prisma/client';
import { ExecResult } from 'src/utils/exec-utils';
import { PersistedVmDto } from 'src/vm/dto/vm.dto';

export interface UpdatedVm {
  vm: Vm;
  logs: ExecResult;
}

export interface IVMManager {
  createVM(vm: PersistedVmDto, deployPath: string): Promise<UpdatedVm>;
  destroyVM(vm: PersistedVmDto): Promise<UpdatedVm>;
  startVM(vm: PersistedVmDto, force: boolean): Promise<UpdatedVm>;
  stopVM(vm: PersistedVmDto): Promise<UpdatedVm>;
  executeCommand(vm: PersistedVmDto, command: string): Promise<ExecResult>;
  restartVM(vm: PersistedVmDto): Promise<UpdatedVm>;
}
