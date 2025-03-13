import { Vm } from "@prisma/client";
import { PersistedVmDto } from "src/vm/dto/vm.dto";

export interface IVMManager {
    createVM(vm: PersistedVmDto, deployPath: string): Promise<Vm>;
    destroyVM(vm: PersistedVmDto): Promise<Vm>;
    startVM(vm: PersistedVmDto, force: boolean): Promise<Vm>;
    stopVM(vm: PersistedVmDto): Promise<Vm>;
    executeCommand(vm: PersistedVmDto, command: string): Promise<string>;
    restartVM(vm: PersistedVmDto): Promise<Vm>;
}
