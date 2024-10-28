import { Injectable, NotFoundException } from '@nestjs/common';
import { VmService } from 'src/vm/vm.service';
import { ProjectRepository } from './project.repository';
import { SourceService } from 'src/source/source.service';
import { exec } from 'child_process';
import { NetworksService } from 'src/networks/networks.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly vmService: VmService,
    private readonly sourceService: SourceService,
    private readonly networksService: NetworksService,
  ) {}

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

  async deleteProject(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    await this.vmService.deletePhisicalVm(project.vmId);

    await this.projectRepository.deleteProject(projectId);

    await this.vmService.deleteVmDb(project.vmId);

    await this.sourceService.deleteSource(project.sourceId);

    await this.networksService.updateNetworksfile();

    await this.execCommand(`rm -rf ${project.path}`);
  }
}
