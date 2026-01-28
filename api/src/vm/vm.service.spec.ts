import { Test, TestingModule } from '@nestjs/testing';
import { VmService } from './vm.service';
import { VmRepository } from './vm.repository';
import { WebSocketService } from '../websockets/websocket.service';
import { NetworksService } from '../networks/networks.service';
import { ProjectService } from '../project/project.service';
import { VmState } from '../types/vm.enum';
import { ServiceStatus } from '../types/service.enum';
import { EventScope, EventType } from '../websockets/dto/websocket-event.dto';
import { IVMManager, UpdatedVm } from '../vm-manager/types/ivm.manager';

describe('VmService', () => {
  let service: VmService;
  let vmRepository: jest.Mocked<VmRepository>;
  let websocketService: jest.Mocked<WebSocketService>;
  let networkService: jest.Mocked<NetworksService>;
  let projectService: jest.Mocked<ProjectService>;
  let vmManager: jest.Mocked<IVMManager>;

  const mockVm = {
    id: 'vm-1',
    status: VmState.Stopped,
    ip: '192.168.1.1',
    memory: 1024,
    disk: 512,
    cpus: 2,
    provider: 'libvirt',
    project: {
      id: 'project-1',
      source: {
        id: 'source-1',
      },
    },
  };

  const mockUpdatedVm: UpdatedVm = {
    vm: {
      ...mockVm,
      ip: '192.168.1.2',
    } as any,
    logs: {
      stdout: 'stdout log',
      stderr: 'stderr log',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VmService,
        {
          provide: VmRepository,
          useValue: {
            getVm: jest.fn(),
            updateVm: jest.fn(),
            deleteVm: jest.fn(),
          },
        },
        {
          provide: WebSocketService,
          useValue: {
            notifyAll: jest.fn(),
          },
        },
        {
          provide: NetworksService,
          useValue: {
            updateNetworksfile: jest.fn(),
          },
        },
        {
          provide: ProjectService,
          useValue: {
            updateAllServiceStatus: jest.fn(),
          },
        },
        {
          provide: 'IVM_MANAGER',
          useValue: {
            createVM: jest.fn(),
            destroyVM: jest.fn(),
            startVM: jest.fn(),
            stopVM: jest.fn(),
            restartVM: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VmService>(VmService);
    vmRepository = module.get(VmRepository);
    websocketService = module.get(WebSocketService);
    networkService = module.get(NetworksService);
    projectService = module.get(ProjectService);
    vmManager = module.get('IVM_MANAGER');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changeVmStatus', () => {
    it('should change VM status and notify via websocket', async () => {
      const updatedVm = {
        ...mockVm,
        status: VmState.Running,
      };
      vmRepository.updateVm.mockResolvedValue(updatedVm as any);
      vmRepository.getVm.mockResolvedValue(updatedVm as any);

      await service.changeVmStatus('vm-1', VmState.Running);

      expect(vmRepository.updateVm).toHaveBeenCalledWith({
        where: { id: 'vm-1' },
        data: {
          status: VmState.Running,
          statusTimeStamp: expect.any(Date),
        },
      });
      expect(websocketService.notifyAll).toHaveBeenCalledWith({
        scope: EventScope.PROJECT,
        event: EventType.STATUS_CHANGE,
        target: 'project-1',
        data: {
          status: VmState.Running,
          data: undefined,
        },
      });
      expect(vmRepository.getVm).toHaveBeenCalledWith({ id: 'vm-1' });
    });

    it('should include data in websocket notification', async () => {
      const updatedVm = {
        ...mockVm,
        status: VmState.Running,
      };
      vmRepository.updateVm.mockResolvedValue(updatedVm as any);
      vmRepository.getVm.mockResolvedValue(updatedVm as any);

      const data = { message: 'VM started' };
      await service.changeVmStatus('vm-1', VmState.Running, data);

      expect(websocketService.notifyAll).toHaveBeenCalledWith({
        scope: EventScope.PROJECT,
        event: EventType.STATUS_CHANGE,
        target: 'project-1',
        data: {
          status: VmState.Running,
          data,
        },
      });
    });
  });

  describe('createVM', () => {
    it('should create VM successfully', async () => {
      vmRepository.getVm.mockResolvedValue(mockVm as any);
      vmManager.createVM.mockResolvedValue(mockUpdatedVm);

      const result = await service.createVM('vm-1', '/path/to/deploy');

      expect(result).toEqual(mockUpdatedVm.vm);
      expect(vmManager.createVM).toHaveBeenCalledWith(
        mockVm,
        '/path/to/deploy',
      );
    });
  });

  describe('upVm', () => {
    it('should start VM successfully', async () => {
      vmRepository.getVm.mockResolvedValue(mockVm as any);
      vmManager.startVM.mockResolvedValue(mockUpdatedVm);
      vmRepository.updateVm.mockResolvedValue(mockUpdatedVm.vm as any);
      vmRepository.getVm.mockResolvedValueOnce(mockVm as any);
      vmRepository.getVm.mockResolvedValueOnce({
        ...mockVm,
        status: VmState.Running,
      } as any);
      networkService.updateNetworksfile.mockResolvedValue();
      projectService.updateAllServiceStatus.mockResolvedValue();

      await service.upVm('vm-1');

      expect(vmRepository.getVm).toHaveBeenCalledWith({ id: 'vm-1' });
      expect(vmManager.startVM).toHaveBeenCalledWith(mockVm, false);
      expect(vmRepository.updateVm).toHaveBeenCalled();
      expect(networkService.updateNetworksfile).toHaveBeenCalled();
      expect(projectService.updateAllServiceStatus).toHaveBeenCalledWith(
        'project-1',
        ServiceStatus.Running,
      );
    });

    it('should throw error if VM is already running', async () => {
      const runningVm = {
        ...mockVm,
        status: VmState.Running,
      };

      vmRepository.getVm.mockResolvedValue(runningVm as any);

      await expect(service.upVm('vm-1')).rejects.toThrow(
        'VM is already running',
      );
      expect(vmManager.startVM).not.toHaveBeenCalled();
    });

    it('should throw error if VM is starting', async () => {
      const startingVm = {
        ...mockVm,
        status: VmState.Starting,
      };

      vmRepository.getVm.mockResolvedValue(startingVm as any);

      await expect(service.upVm('vm-1')).rejects.toThrow(
        'VM is already running',
      );
    });

    it('should force start VM even if already running', async () => {
      const runningVm = {
        ...mockVm,
        status: VmState.Running,
      };

      vmRepository.getVm.mockResolvedValue(runningVm as any);
      vmManager.startVM.mockResolvedValue(mockUpdatedVm);
      vmRepository.updateVm.mockResolvedValue(mockUpdatedVm.vm as any);
      vmRepository.getVm.mockResolvedValueOnce(runningVm as any);
      vmRepository.getVm.mockResolvedValueOnce({
        ...runningVm,
        status: VmState.Running,
      } as any);
      networkService.updateNetworksfile.mockResolvedValue();
      projectService.updateAllServiceStatus.mockResolvedValue();

      await service.upVm('vm-1', true);

      expect(vmManager.startVM).toHaveBeenCalledWith(runningVm, true);
    });
  });

  describe('downVm', () => {
    it('should stop VM successfully', async () => {
      const runningVm = {
        ...mockVm,
        status: VmState.Running,
      };

      vmRepository.getVm.mockResolvedValue(runningVm as any);
      projectService.updateAllServiceStatus.mockResolvedValue();
      vmManager.stopVM.mockResolvedValue(mockUpdatedVm);
      vmRepository.getVm.mockResolvedValueOnce(runningVm as any);
      vmRepository.getVm.mockResolvedValueOnce({
        ...runningVm,
        status: VmState.Stopped,
      } as any);

      await service.downVm('vm-1');

      expect(projectService.updateAllServiceStatus).toHaveBeenCalledWith(
        'project-1',
        ServiceStatus.Stopped,
      );
      expect(vmManager.stopVM).toHaveBeenCalledWith(runningVm);
    });

    it('should throw error if VM is already stopped', async () => {
      vmRepository.getVm.mockResolvedValue(mockVm as any);

      await expect(service.downVm('vm-1')).rejects.toThrow(
        'VM is already stopped',
      );
      expect(vmManager.stopVM).not.toHaveBeenCalled();
    });

    it('should force stop VM even if already stopped', async () => {
      vmRepository.getVm.mockResolvedValue(mockVm as any);
      projectService.updateAllServiceStatus.mockResolvedValue();
      vmManager.stopVM.mockResolvedValue(mockUpdatedVm);
      vmRepository.getVm.mockResolvedValueOnce(mockVm as any);
      vmRepository.getVm.mockResolvedValueOnce({
        ...mockVm,
        status: VmState.Stopped,
      } as any);

      await service.downVm('vm-1', true);

      expect(vmManager.stopVM).toHaveBeenCalledWith(mockVm);
    });
  });

  describe('restartVm', () => {
    it('should restart VM successfully', async () => {
      const runningVm = {
        ...mockVm,
        status: VmState.Running,
      };

      vmRepository.getVm.mockResolvedValue(runningVm as any);
      projectService.updateAllServiceStatus.mockResolvedValue();
      vmManager.restartVM.mockResolvedValue(mockUpdatedVm);
      vmRepository.updateVm.mockResolvedValue(mockUpdatedVm.vm as any);
      vmRepository.getVm.mockResolvedValueOnce(runningVm as any);
      vmRepository.getVm.mockResolvedValueOnce({
        ...runningVm,
        status: VmState.Running,
      } as any);
      projectService.updateAllServiceStatus.mockResolvedValue();

      await service.restartVm('vm-1');

      expect(projectService.updateAllServiceStatus).toHaveBeenCalledTimes(2);
      expect(vmManager.restartVM).toHaveBeenCalledWith(runningVm);
    });

    it('should throw error if VM is stopped', async () => {
      vmRepository.getVm.mockResolvedValue(mockVm as any);

      await expect(service.restartVm('vm-1')).rejects.toThrow('VM is stopped');
      expect(vmManager.restartVM).not.toHaveBeenCalled();
    });
  });

  describe('deletePhisicalVm', () => {
    it('should destroy VM successfully', async () => {
      vmRepository.getVm.mockResolvedValue(mockVm as any);
      vmManager.destroyVM.mockResolvedValue(mockUpdatedVm);

      await service.deletePhisicalVm('vm-1');

      expect(vmManager.destroyVM).toHaveBeenCalledWith(mockVm);
    });

    it('should throw error if VM is starting', async () => {
      const startingVm = {
        ...mockVm,
        status: VmState.Starting,
      };

      vmRepository.getVm.mockResolvedValue(startingVm as any);

      await expect(service.deletePhisicalVm('vm-1')).rejects.toThrow(
        'VM is starting',
      );
      expect(vmManager.destroyVM).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vmRepository.getVm.mockResolvedValue(mockVm as any);
      vmManager.destroyVM.mockRejectedValue(new Error('Destroy failed'));

      await service.deletePhisicalVm('vm-1');

      expect(vmManager.destroyVM).toHaveBeenCalled();
    });
  });

  describe('deleteVmDb', () => {
    it('should delete VM from database', async () => {
      vmRepository.deleteVm.mockResolvedValue(mockVm as any);

      await service.deleteVmDb('vm-1');

      expect(vmRepository.deleteVm).toHaveBeenCalledWith({ id: 'vm-1' });
    });
  });
});
