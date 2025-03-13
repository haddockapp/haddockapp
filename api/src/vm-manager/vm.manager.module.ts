import { Module } from '@nestjs/common';
import { VMManagerProvider } from './vm.manager.provider';

@Module({
  providers: [VMManagerProvider],
  exports: ['IVM_MANAGER'],
})
export class VMManagerModule {}
