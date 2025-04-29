import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { ProjectRepository } from 'src/project/project.repository';
import { ExecutionError } from 'src/types/error/execution.error';
import { VmState } from 'src/types/vm.enum';
import { PersistedVmDto } from 'src/vm/dto/vm.dto';
import { VmRepository } from 'src/vm/vm.repository';
import { VmService } from 'src/vm/vm.service';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartupService.name);

  constructor(
    private readonly vmRepository: VmRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly vmService: VmService,
  ) {}

  private async manageVmError(vmId: string) {
    const vm: PersistedVmDto = await this.vmRepository.getVm({ id: vmId });

    if (vm.status === VmState.Starting || vm.status === VmState.Running) {
      try {
        await this.vmService.downVm(vmId);
      } catch (e) {
        if (e instanceof ExecutionError) {
          this.logger.error(`Failed to stop vm: ${e.message}`);
        }
      }
    }
    await this.vmService.changeVmStatus(vmId, VmState.Error);
  }

  private async manageVm(project: PersistedProjectDto) {
    try {
      if (
        project.vm.status === VmState.Running ||
        project.vm.status === VmState.Starting
      ) {
        this.logger.log(`Starting VM for project ${project.id}`);
        await this.vmService.upVm(project.vmId, true);
      }

      if (
        project.vm.status === VmState.Stopped ||
        project.vm.status === VmState.Error ||
        project.vm.status === VmState.Stopping
      ) {
        this.logger.log(`Stopping VM for project ${project.id}`);
        await this.vmService.downVm(project.vmId, true);
      }
    } catch (e) {
      if (e instanceof ExecutionError) {
        this.logger.error(`Failed to execute command: ${e.message}`);
      } else {
        this.logger.error(`Unexpected error: ${e.message}`);
      }
      await this.manageVmError(project.vmId);
    }
  }

  private async manageVms() {
    this.logger.log('Managing VMs');

    const projects = await this.projectRepository.findAllProjects();

    for (const project of projects) {
      this.manageVm(project);
    }
    this.logger.log('VMs status managed');
  }

  private async start() {
    this.logger.log('Starting Haddock');
    await this.manageVms();
    this.logger.log('Haddock started');
  }

  async onApplicationBootstrap() {
    await this.start();
  }
}
