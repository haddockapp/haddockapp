import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { VmService } from '../vm/vm.service';
import { SourceService } from '../source/source.service';
import { NetworksService } from '../networks/networks.service';
import { WebSocketService } from '../websockets/websocket.service';
import { DockerService } from '../docker/docker.service';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { UpdateProjectDto } from './dto/UpdateProject.dto';
import { EnvironmentVar } from './dto/environmentVar';
import { ServiceAction, ServiceActionDto } from './dto/serviceAction.dto';
import { ServiceStatus } from '../types/service.enum';
import { VmState } from '../types/vm.enum';
import { ExecutionError } from '../types/error/execution.error';
import { EventScope, EventType } from '../websockets/dto/websocket-event.dto';
import { SourceType } from '../source/dto/create-source.dto';
import axios from 'axios';

jest.mock('axios');
jest.mock('src/utils/exec-utils', () => ({
  execCommand: jest.fn().mockResolvedValue({ stdout: '', stderr: '' }),
}));

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepository: jest.Mocked<ProjectRepository>;
  let vmService: jest.Mocked<VmService>;
  let sourceService: jest.Mocked<SourceService>;
  let networksService: jest.Mocked<NetworksService>;
  let webSocketService: jest.Mocked<WebSocketService>;
  let dockerService: jest.Mocked<DockerService>;
  let deployQueue: jest.Mocked<Queue>;
  let sourceRepository: any;

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Description',
    path: '/workspaces/project-1',
    vmId: 'vm-1',
    sourceId: 'source-1',
    environmentVars: [],
    services: [],
    vm: {
      id: 'vm-1',
      status: VmState.Stopped,
      ip: '192.168.1.1',
    },
    source: {
      id: 'source-1',
      type: SourceType.GITHUB,
    },
  };

  const mockService = {
    id: 'service-1',
    name: 'test-service',
    image: 'nginx:latest',
    status: ServiceStatus.Stopped,
    ports: ['80'],
    networks: [],
    depends_on: [],
    environment: '{}',
    user: 'null',
    deployment: 'null',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ProjectRepository,
          useValue: {
            createProject: jest.fn(),
            findProjectById: jest.fn(),
            updateProject: jest.fn(),
            deleteProject: jest.fn(),
            updateEnvironmentVars: jest.fn(),
            updateServiceStatus: jest.fn(),
          },
        },
        {
          provide: VmService,
          useValue: {
            deletePhisicalVm: jest.fn(),
            deleteVmDb: jest.fn(),
          },
        },
        {
          provide: SourceService,
          useValue: {
            registerSource: jest.fn(),
            deletePhysicalFiles: jest.fn(),
            deleteSource: jest.fn(),
            deploySource: jest.fn(),
            findSourceById: jest.fn(),
          },
        },
        {
          provide: 'SourceRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: NetworksService,
          useValue: {
            updateNetworksfile: jest.fn(),
          },
        },
        {
          provide: WebSocketService,
          useValue: {
            removeProject: jest.fn(),
            notifyAll: jest.fn(),
          },
        },
        {
          provide: DockerService,
          useValue: {
            getImageLogo: jest.fn(),
          },
        },
        {
          provide: getQueueToken('deploys'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectRepository = module.get(ProjectRepository);
    vmService = module.get(VmService);
    sourceService = module.get(SourceService);
    networksService = module.get(NetworksService);
    webSocketService = module.get(WebSocketService);
    dockerService = module.get(DockerService);
    deployQueue = module.get(getQueueToken('deploys'));
    sourceRepository = (sourceService as any).sourceRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const createProjectDto: CreateProjectDto = {
        vm_memory: 1024,
        vm_disk: 512,
        vm_cpus: 2,
        source: {
          type: SourceType.GITHUB,
          repository: 'test/repo',
          branch: 'main',
          compose_path: 'docker-compose.yml',
          environmentVars: [],
        },
      };

      const createdSource = {
        id: 'source-1',
        environmentVars: [],
      };

      const createdProject = {
        id: 'project-1',
        ...mockProject,
      };

      sourceService.registerSource.mockResolvedValue(createdSource as any);
      projectRepository.createProject.mockResolvedValue(createdProject as any);
      projectRepository.updateEnvironmentVars.mockResolvedValue(
        createdProject as any,
      );
      projectRepository.findProjectById.mockResolvedValue(
        createdProject as any,
      );

      const result = await service.createProject(createProjectDto);

      expect(result).toEqual(createdProject);
      expect(sourceService.registerSource).toHaveBeenCalledWith(
        createProjectDto.source,
      );
      expect(projectRepository.createProject).toHaveBeenCalled();
    });

    it('should merge environment variables from source and project', async () => {
      const createProjectDto: CreateProjectDto = {
        vm_memory: 1024,
        vm_disk: 512,
        vm_cpus: 2,
        source: {
          type: SourceType.GITHUB,
          repository: 'test/repo',
          branch: 'main',
          compose_path: 'docker-compose.yml',
          environmentVars: [
            { key: 'SOURCE_VAR', value: 'source_value', isSecret: false },
          ],
        },
      };

      const createdSource = {
        id: 'source-1',
        environmentVars: [
          { key: 'SOURCE_VAR', value: 'updated_value', isSecret: false },
        ],
      };

      const createdProject = {
        id: 'project-1',
        ...mockProject,
      };

      sourceService.registerSource.mockResolvedValue(createdSource as any);
      projectRepository.createProject.mockResolvedValue(createdProject as any);
      projectRepository.updateEnvironmentVars.mockResolvedValue(
        createdProject as any,
      );
      projectRepository.findProjectById.mockResolvedValue(
        createdProject as any,
      );

      await service.createProject(createProjectDto);

      expect(projectRepository.updateEnvironmentVars).toHaveBeenCalledWith(
        'project-1',
        expect.arrayContaining([
          expect.objectContaining({
            key: 'SOURCE_VAR',
            value: 'updated_value',
          }),
        ]),
      );
    });

    it('should throw NotFoundException if project not found after creation', async () => {
      const createProjectDto: CreateProjectDto = {
        vm_memory: 1024,
        vm_disk: 512,
        vm_cpus: 2,
        source: {
          type: SourceType.GITHUB,
          repository: 'test/repo',
          branch: 'main',
          compose_path: 'docker-compose.yml',
          environmentVars: [],
        },
      };

      const createdSource = {
        id: 'source-1',
        environmentVars: [],
      };

      const createdProject = {
        id: 'project-1',
        ...mockProject,
      };

      sourceService.registerSource.mockResolvedValue(createdSource as any);
      projectRepository.createProject.mockResolvedValue(createdProject as any);
      projectRepository.updateEnvironmentVars.mockResolvedValue(
        createdProject as any,
      );
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(service.createProject(createProjectDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const updateDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const updatedProject = {
        ...mockProject,
        name: 'Updated Name',
        description: 'Updated Description',
      };

      projectRepository.updateProject.mockResolvedValue(updatedProject as any);

      const result = await service.updateProject('project-1', updateDto);

      expect(result).toEqual(updatedProject);
      expect(projectRepository.updateProject).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          name: updateDto.name,
          description: updateDto.description,
        },
      });
    });

    it('should update project with workspace_id', async () => {
      const updateDto: UpdateProjectDto = {
        workspace_id: 'workspace-1',
      };

      const updatedProject = {
        ...mockProject,
      };

      projectRepository.updateProject.mockResolvedValue(updatedProject as any);

      await service.updateProject('project-1', updateDto);

      expect(projectRepository.updateProject).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          workspace: {
            connect: { id: 'workspace-1' },
          },
        },
      });
    });

    it('should update project with authorization_id', async () => {
      const updateDto: UpdateProjectDto = {
        authorization_id: 'auth-1',
      };

      const updatedProject = {
        ...mockProject,
      };

      projectRepository.updateProject.mockResolvedValue(updatedProject as any);

      await service.updateProject('project-1', updateDto);

      expect(projectRepository.updateProject).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          source: {
            update: {
              authorizationId: 'auth-1',
            },
          },
        },
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject as any);
      vmService.deletePhisicalVm.mockResolvedValue();
      sourceService.deletePhysicalFiles.mockResolvedValue();
      projectRepository.deleteProject.mockResolvedValue(mockProject as any);
      vmService.deleteVmDb.mockResolvedValue();
      sourceService.deleteSource.mockResolvedValue();
      networksService.updateNetworksfile.mockResolvedValue();

      await service.deleteProject('project-1');

      expect(projectRepository.findProjectById).toHaveBeenCalledWith(
        'project-1',
      );
      expect(vmService.deletePhisicalVm).toHaveBeenCalledWith('vm-1');
      expect(sourceService.deletePhysicalFiles).toHaveBeenCalledWith(
        'source-1',
      );
      expect(projectRepository.deleteProject).toHaveBeenCalledWith('project-1');
      expect(vmService.deleteVmDb).toHaveBeenCalledWith('vm-1');
      expect(sourceService.deleteSource).toHaveBeenCalledWith('source-1');
      expect(webSocketService.removeProject).toHaveBeenCalledWith('project-1');
    });

    it('should throw NotFoundException if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(service.deleteProject('project-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findProjectById', () => {
    it('should find project by id', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject as any);

      const result = await service.findProjectById('project-1');

      expect(result).toEqual(mockProject);
      expect(projectRepository.findProjectById).toHaveBeenCalledWith(
        'project-1',
      );
    });

    it('should return null if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      const result = await service.findProjectById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('stopProject', () => {
    it('should add stop job to queue', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject as any);

      await service.stopProject('project-1');

      expect(projectRepository.findProjectById).toHaveBeenCalledWith(
        'project-1',
      );
      expect(deployQueue.add).toHaveBeenCalledWith('stop', mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(service.stopProject('project-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('startProject', () => {
    it('should add start job to queue', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject as any);

      await service.startProject('project-1');

      expect(projectRepository.findProjectById).toHaveBeenCalledWith(
        'project-1',
      );
      expect(deployQueue.add).toHaveBeenCalledWith('start', mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(service.startProject('project-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deployProject', () => {
    it('should deploy project successfully', async () => {
      const projectWithVm = {
        ...mockProject,
        vm: {
          ...mockProject.vm,
          status: VmState.Stopped,
        },
      };

      projectRepository.findProjectById.mockResolvedValue(projectWithVm as any);
      sourceService.deploySource.mockResolvedValue();

      await service.deployProject('project-1');

      expect(projectRepository.findProjectById).toHaveBeenCalledWith(
        'project-1',
      );
      expect(sourceService.deploySource).toHaveBeenCalledWith(
        'source-1',
        false,
      );
    });

    it('should throw NotFoundException if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(service.deployProject('project-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if project is already running', async () => {
      const projectWithRunningVm = {
        ...mockProject,
        vm: {
          ...mockProject.vm,
          status: VmState.Running,
        },
      };

      projectRepository.findProjectById.mockResolvedValue(
        projectWithRunningVm as any,
      );

      await expect(service.deployProject('project-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if project is starting', async () => {
      const projectWithStartingVm = {
        ...mockProject,
        vm: {
          ...mockProject.vm,
          status: VmState.Starting,
        },
      };

      projectRepository.findProjectById.mockResolvedValue(
        projectWithStartingVm as any,
      );

      await expect(service.deployProject('project-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('recreateProject', () => {
    it('should recreate project successfully', async () => {
      const projectWithStoppedVm = {
        ...mockProject,
        vm: {
          ...mockProject.vm,
          status: VmState.Stopped,
        },
      };

      projectRepository.findProjectById.mockResolvedValue(
        projectWithStoppedVm as any,
      );
      vmService.deletePhisicalVm.mockResolvedValue();
      sourceService.deploySource.mockResolvedValue();

      await service.recreateProject('project-1');

      expect(vmService.deletePhisicalVm).toHaveBeenCalledWith('vm-1');
      expect(sourceService.deploySource).toHaveBeenCalledWith('source-1');
    });

    it('should throw BadRequestException if project is already running', async () => {
      const projectWithRunningVm = {
        ...mockProject,
        vm: {
          ...mockProject.vm,
          status: VmState.Running,
        },
      };

      projectRepository.findProjectById.mockResolvedValue(
        projectWithRunningVm as any,
      );

      await expect(service.recreateProject('project-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle errors when deleting VM', async () => {
      const projectWithStoppedVm = {
        ...mockProject,
        vm: {
          ...mockProject.vm,
          status: VmState.Stopped,
        },
      };

      projectRepository.findProjectById.mockResolvedValue(
        projectWithStoppedVm as any,
      );
      const error = new ExecutionError('stdout', 'VM deletion failed');
      vmService.deletePhisicalVm.mockRejectedValue(error);

      await service.recreateProject('project-1');

      expect(sourceService.deploySource).not.toHaveBeenCalled();
    });
  });

  describe('createEnvironment', () => {
    it('should create environment variable successfully', async () => {
      const envVar: EnvironmentVar = {
        key: 'TEST_KEY',
        value: 'test_value',
        isSecret: false,
      };

      const project = {
        ...mockProject,
        environmentVars: [],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      projectRepository.updateEnvironmentVars.mockResolvedValue(project as any);

      const result = await service.createEnvironment('project-1', envVar);

      expect(result.key).toBe('TEST_KEY');
      expect(result.value).toBe('test_value');
      expect(projectRepository.updateEnvironmentVars).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid environment variable key', async () => {
      const envVar: EnvironmentVar = {
        key: '123_INVALID',
        value: 'test_value',
        isSecret: false,
      };

      const project = {
        ...mockProject,
        environmentVars: [],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      await expect(
        service.createEnvironment('project-1', envVar),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid environment variable value', async () => {
      const envVar: EnvironmentVar = {
        key: 'VALID_KEY',
        value: 'test\u0000value',
        isSecret: false,
      };

      const project = {
        ...mockProject,
        environmentVars: [],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      await expect(
        service.createEnvironment('project-1', envVar),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      const envVar: EnvironmentVar = {
        key: 'TEST_KEY',
        value: 'test_value',
        isSecret: false,
      };

      await expect(
        service.createEnvironment('project-1', envVar),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if environment variable already exists', async () => {
      const envVar: EnvironmentVar = {
        key: 'EXISTING_KEY',
        value: 'test_value',
        isSecret: false,
      };

      const project = {
        ...mockProject,
        environmentVars: [envVar],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      await expect(
        service.createEnvironment('project-1', envVar),
      ).rejects.toThrow(BadRequestException);
    });

    it('should obfuscate secret environment variables', async () => {
      const envVar: EnvironmentVar = {
        key: 'SECRET_KEY',
        value: 'secret_value',
        isSecret: true,
      };

      const project = {
        ...mockProject,
        environmentVars: [],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      projectRepository.updateEnvironmentVars.mockResolvedValue(project as any);

      const result = await service.createEnvironment('project-1', envVar);

      expect(result.value).toBe('*'.repeat('secret_value'.length));
      expect(result.isSecret).toBe(true);
    });
  });

  describe('updateEnvironment', () => {
    it('should update environment variable successfully', async () => {
      const existingEnvVar: EnvironmentVar = {
        key: 'EXISTING_KEY',
        value: 'old_value',
        isSecret: false,
      };

      const updatedEnvVar: EnvironmentVar = {
        key: 'EXISTING_KEY',
        value: 'new_value',
        isSecret: false,
      };

      const project = {
        ...mockProject,
        environmentVars: [existingEnvVar],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      projectRepository.updateEnvironmentVars.mockResolvedValue(project as any);

      const result = await service.updateEnvironment(
        'project-1',
        'EXISTING_KEY',
        updatedEnvVar,
      );

      expect(result.value).toBe('new_value');
      expect(projectRepository.updateEnvironmentVars).toHaveBeenCalled();
    });

    it('should throw NotFoundException if environment variable not found', async () => {
      const project = {
        ...mockProject,
        environmentVars: [],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      const envVar: EnvironmentVar = {
        key: 'NON_EXISTING_KEY',
        value: 'value',
        isSecret: false,
      };

      await expect(
        service.updateEnvironment('project-1', 'NON_EXISTING_KEY', envVar),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid environment variable', async () => {
      const existingEnvVar: EnvironmentVar = {
        key: 'EXISTING_KEY',
        value: 'old_value',
        isSecret: false,
      };

      const invalidEnvVar: EnvironmentVar = {
        key: '123_INVALID',
        value: 'value',
        isSecret: false,
      };

      const project = {
        ...mockProject,
        environmentVars: [existingEnvVar],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      await expect(
        service.updateEnvironment('project-1', 'EXISTING_KEY', invalidEnvVar),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteEnvironment', () => {
    it('should delete environment variable successfully', async () => {
      const envVar: EnvironmentVar = {
        key: 'TO_DELETE',
        value: 'value',
        isSecret: false,
      };

      const project = {
        ...mockProject,
        environmentVars: [envVar],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      projectRepository.updateEnvironmentVars.mockResolvedValue(project as any);

      await service.deleteEnvironment('project-1', 'TO_DELETE');

      expect(projectRepository.updateEnvironmentVars).toHaveBeenCalledWith(
        'project-1',
        [],
      );
    });

    it('should throw NotFoundException if environment variable not found', async () => {
      const project = {
        ...mockProject,
        environmentVars: [],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      await expect(
        service.deleteEnvironment('project-1', 'NON_EXISTING'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEnvironmentVars', () => {
    it('should return obfuscated environment variables', async () => {
      const envVars: EnvironmentVar[] = [
        { key: 'PUBLIC_KEY', value: 'public_value', isSecret: false },
        { key: 'SECRET_KEY', value: 'secret_value', isSecret: true },
      ];

      const project = {
        ...mockProject,
        environmentVars: envVars,
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      const result = await service.getEnvironmentVars('project-1');

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe('public_value');
      expect(result[1].value).toBe('*'.repeat('secret_value'.length));
    });

    it('should throw NotFoundException if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(service.getEnvironmentVars('project-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateServiceStatus', () => {
    it('should update service status and notify via websocket', async () => {
      projectRepository.updateServiceStatus.mockResolvedValue();

      await service.updateServiceStatus(
        'project-1',
        'service-1',
        ServiceStatus.Running,
      );

      expect(projectRepository.updateServiceStatus).toHaveBeenCalledWith(
        'project-1',
        'service-1',
        ServiceStatus.Running,
      );
      expect(webSocketService.notifyAll).toHaveBeenCalledWith({
        scope: EventScope.SERVICE,
        event: EventType.STATUS_CHANGE,
        target: 'project-1',
        data: {
          service: 'service-1',
          status: ServiceStatus.Running,
        },
      });
    });
  });

  describe('updateAllServiceStatus', () => {
    it('should update all services status', async () => {
      const project = {
        ...mockProject,
        services: [mockService, { ...mockService, id: 'service-2' }],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      projectRepository.updateServiceStatus.mockResolvedValue();

      await service.updateAllServiceStatus('project-1', ServiceStatus.Running);

      expect(projectRepository.updateServiceStatus).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(
        service.updateAllServiceStatus('project-1', ServiceStatus.Running),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('serviceAction', () => {
    beforeEach(() => {
      (axios.post as jest.Mock) = jest.fn();
    });

    it('should start a service successfully', async () => {
      const project = {
        ...mockProject,
        services: [mockService],
        vm: {
          ...mockProject.vm,
          ip: '192.168.1.1',
        },
      };

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.START,
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      (axios.post as jest.Mock).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });
      projectRepository.updateServiceStatus.mockResolvedValue();

      await service.serviceAction('project-1', actionDto);

      expect(axios.post).toHaveBeenCalledWith(
        'http://192.168.1.1:55001/action',
        {
          service: 'test-service',
          action: ServiceAction.START,
        },
      );
      expect(projectRepository.updateServiceStatus).toHaveBeenCalledWith(
        'project-1',
        'service-1',
        ServiceStatus.Running,
      );
    });

    it('should stop a service successfully', async () => {
      const runningService = {
        ...mockService,
        status: ServiceStatus.Running,
      };

      const project = {
        ...mockProject,
        services: [runningService],
        vm: {
          ...mockProject.vm,
          ip: '192.168.1.1',
        },
      };

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.STOP,
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      (axios.post as jest.Mock).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });
      projectRepository.updateServiceStatus.mockResolvedValue();

      await service.serviceAction('project-1', actionDto);

      expect(axios.post).toHaveBeenCalledWith(
        'http://192.168.1.1:55001/action',
        {
          service: 'test-service',
          action: ServiceAction.STOP,
        },
      );
      expect(projectRepository.updateServiceStatus).toHaveBeenCalledWith(
        'project-1',
        'service-1',
        ServiceStatus.Stopped,
      );
    });

    it('should restart a service successfully', async () => {
      const runningService = {
        ...mockService,
        status: ServiceStatus.Running,
      };

      const project = {
        ...mockProject,
        services: [runningService],
        vm: {
          ...mockProject.vm,
          ip: '192.168.1.1',
        },
      };

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.RESTART,
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      (axios.post as jest.Mock).mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });
      projectRepository.updateServiceStatus.mockResolvedValue();

      await service.serviceAction('project-1', actionDto);

      expect(axios.post).toHaveBeenCalledWith(
        'http://192.168.1.1:55001/action',
        {
          service: 'test-service',
          action: ServiceAction.RESTART,
        },
      );
      expect(projectRepository.updateServiceStatus).toHaveBeenCalledWith(
        'project-1',
        'service-1',
        ServiceStatus.Running,
      );
    });

    it('should throw NotFoundException if project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.START,
      };

      await expect(
        service.serviceAction('project-1', actionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if service not found', async () => {
      const project = {
        ...mockProject,
        services: [],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      const actionDto: ServiceActionDto = {
        service: 'non-existent',
        action: ServiceAction.START,
      };

      await expect(
        service.serviceAction('project-1', actionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if service is already running when starting', async () => {
      const runningService = {
        ...mockService,
        status: ServiceStatus.Running,
      };

      const project = {
        ...mockProject,
        services: [runningService],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.START,
      };

      await expect(
        service.serviceAction('project-1', actionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if service is already stopped when stopping', async () => {
      const project = {
        ...mockProject,
        services: [mockService],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.STOP,
      };

      await expect(
        service.serviceAction('project-1', actionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if service is stopped when restarting', async () => {
      const project = {
        ...mockProject,
        services: [mockService],
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.RESTART,
      };

      await expect(
        service.serviceAction('project-1', actionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if API call fails', async () => {
      const runningService = {
        ...mockService,
        status: ServiceStatus.Running,
      };

      const project = {
        ...mockProject,
        services: [runningService],
        vm: {
          ...mockProject.vm,
          ip: '192.168.1.1',
        },
      };

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.STOP,
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        service.serviceAction('project-1', actionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if API returns non-ok status', async () => {
      const runningService = {
        ...mockService,
        status: ServiceStatus.Running,
      };

      const project = {
        ...mockProject,
        services: [runningService],
        vm: {
          ...mockProject.vm,
          ip: '192.168.1.1',
        },
      };

      const actionDto: ServiceActionDto = {
        service: 'service-1',
        action: ServiceAction.STOP,
      };

      projectRepository.findProjectById.mockResolvedValue(project as any);
      (axios.post as jest.Mock).mockResolvedValue({
        status: 200,
        data: { status: 'error' },
      });

      await expect(
        service.serviceAction('project-1', actionDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
