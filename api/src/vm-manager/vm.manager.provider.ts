import { FactoryProvider } from "@nestjs/common";
import { LimaManager } from "./managers/lima/lima.manager";
import { VagrantManager } from "./managers/vagrant/vagrant.manager";
import { IVMManager } from "./types/ivm.manager";

export const VMManagerProvider: FactoryProvider<IVMManager> = {
    provide: 'IVM_MANAGER',
    useFactory: (): IVMManager => {
      const vmManagerType = process.env.VM_MANAGER || 'vagrant'; // Default to Vagrant

      switch (vmManagerType) {
        case 'lima':
          return new LimaManager();
        case 'vagrant':
        default:
          return new VagrantManager();
      }
    },
  };
