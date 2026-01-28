import { Test, TestingModule } from '@nestjs/testing';
import { StartupService } from './startup.service';
import { VmRepository } from '../vm/vm.repository';
import { ProjectRepository } from '../project/project.repository';
import { VmService } from '../vm/vm.service';
import { VmState } from '../types/vm.enum';
import { ExecutionError } from '../types/error/execution.error';

describe('StartupService', () => {
  let service: StartupService;
  let vmRepository: jest.Mocked<VmRepository>;
  let projectRepository: jest.Mocked<ProjectRepository>;
  let vmService: jest.Mocked<VmService>;

  const mockProject = {
    id: 'project-1',
    vmId: 'vm-1',
    vm: {
      id: 'vm-1',
      status: VmState.Stopped,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartupService,
        {
          provide: VmRepository,
          useValue: {
            getVm: jest.fn(),
          },
        },
        {
          provide: ProjectRepository,
          useValue: {
            findAllProjects: jest.fn(),
          },
        },
        {
          provide: VmService,
          useValue: {
            upVm: jest.fn(),
            downVm: jest.fn(),
            changeVmStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StartupService>(StartupService);
    vmRepository = module.get(VmRepository);
    projectRepository = module.get(ProjectRepository);
    vmService = module.get(VmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should manage VMs on bootstrap', async () => {
      projectRepository.findAllProjects.mockResolvedValue([mockProject] as any);
      vmRepository.getVm.mockResolvedValue({
        ...mockProject.vm,
        project: mockProject,
      } as any);
      vmService.downVm.mockResolvedValue();

      await service.onApplicationBootstrap();

      expect(projectRepository.findAllProjects).toHaveBeenCalled();
    });

    it('should start running VMs', async () => {
      const runningProject = {
        ...mockProject,
        vm: {
          ...mockProject.vm,
          status: VmState.Running,
        },
      };

      projectRepository.findAllProjects.mockResolvedValue([
        runningProject,
      ] as any);
      vmRepository.getVm.mockResolvedValue({
        ...runningProject.vm,
        project: runningProject,
      } as any);
      vmService.upVm.mockResolvedValue();

      await service.onApplicationBootstrap();

      expect(vmService.upVm).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      projectRepository.findAllProjects.mockResolvedValue([mockProject] as any);
      vmRepository.getVm.mockResolvedValue({
        ...mockProject.vm,
        project: mockProject,
      } as any);
      vmService.downVm.mockRejectedValue(
        new ExecutionError('stdout', 'VM error'),
      );
      vmService.changeVmStatus.mockResolvedValue();

      await service.onApplicationBootstrap();

      expect(vmService.changeVmStatus).toHaveBeenCalledWith(
        'vm-1',
        VmState.Error,
      );
    });

    it('should handle empty projects list', async () => {
      projectRepository.findAllProjects.mockResolvedValue([]);

      await service.onApplicationBootstrap();

      expect(projectRepository.findAllProjects).toHaveBeenCalled();
    });
  });
});
