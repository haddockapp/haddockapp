import { FactoryProvider } from '@nestjs/common';
import { IVMManager } from './types/ivm.manager';
import { VagrantManager } from './managers/vagrant/vagrant.manager';

export const VMManagerProvider: FactoryProvider<IVMManager> = {
  provide: 'IVM_MANAGER',
  useFactory: (): IVMManager => {
    const vmManagerType = process.env.VM_MANAGER || 'vagrant'; // Default to Vagrant

    switch (vmManagerType) {
      case 'vagrant':
      default:
        return new VagrantManager();
    }
  },
};
