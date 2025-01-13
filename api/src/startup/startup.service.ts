import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PersistedProjectDto } from 'src/project/dto/project.dto';
import { ProjectRepository } from 'src/project/project.repository';
import { ExecutionError } from 'src/types/error/execution.error';
import { VmState } from 'src/types/vm.enum';
import { VmService } from 'src/vm/vm.service';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectRepository: ProjectRepository,
    private readonly vmService: VmService,
  ) {}

//   private async stopCaddy() {
//     this.logger.log('Stopping all Caddy instances');

//     try {
//       await execCommand('pkill -f caddy');
//       this.logger.log('Caddy instances stopped');
//     } catch (error) {
//       this.logger.error('Failed to stop Caddy instances', error.message);
//     }
//   }

//   private async clearServicesCaddy() {
//     this.logger.log('Clearing Caddy services');

//     try {
//       await promises.truncate(process.env.CADDY_SERVICES_FILE, 0); // Truncate the file to 0 bytes    } catch (error) {
//       this.logger.log('Caddy services cleared');
//     } catch (error) {
//       this.logger.error('Failed to clear Caddy services', error.message);
//     }
//   }

//   private async startCaddy() {
//     this.logger.log('Starting Caddy');

//     try {
//       const caddyProcess = spawn('caddy', ['run'], {
//         cwd: process.env.CADDY_ROOT_DIR,
//         detached: true,
//         stdio: 'ignore',
//       });
//       this.logger.log(`Caddy started on PID ${caddyProcess.pid}`);
//     } catch (error) {
//       this.logger.error('Failed to start Caddy', error);
//     }
//   }

  private async manageVmError(vmId: string) {
    const vm = await this.prisma.vm.findUnique({
      where: {
        id: vmId,
      },
    });
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
        project.vm.status === VmState.Error
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
    // await this.stopCaddy();
    // await this.clearServicesCaddy();
    // await this.startCaddy();
    await this.manageVms();
    this.logger.log('Haddock started');
  }

  async onApplicationBootstrap() {
    await this.start();
  }
}
