import { Test, TestingModule } from '@nestjs/testing';
import { ProjectRepository } from './project.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { ServiceDto } from '../compose/model/Service';
import { ServiceStatus } from '../types/service.enum';
import { EnvironmentVar } from './dto/environmentVar';

describe('ProjectRepository', () => {
  let repository: ProjectRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    vm: {
      id: 'vm-1',
      memory: 1024,
      disk: 256,
      cpus: 2,
    },
    source: {
      id: 'source-1',
      type: 'github',
    },
    services: [],
    networkConnections: [],
  };

  const mockService = {
    id: 'service-1',
    projectId: 'project-1',
    name: 'test-service',
    image: 'nginx:latest',
    ports: ['80:80'],
    networks: ['network1'],
    depends_on: [],
    environment: '{}',
    user: null,
    deployment: null,
    status: ServiceStatus.Running,
    statusTimeStamp: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectRepository,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            service: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<ProjectRepository>(ProjectRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllProjects', () => {
    it('should return all projects', async () => {
      const projects = [mockProject];
      (prismaService.project.findMany as jest.Mock).mockResolvedValue(projects);

      const result = await repository.findAllProjects();

      expect(result).toEqual(projects);
      expect(prismaService.project.findMany).toHaveBeenCalledWith({
        include: {
          vm: true,
          source: true,
        },
      });
    });

    it('should return empty array when no projects exist', async () => {
      (prismaService.project.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findAllProjects();

      expect(result).toEqual([]);
    });
  });

  describe('findProjectById', () => {
    it('should return a project by id', async () => {
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );

      const result = await repository.findProjectById('project-1');

      expect(result).toEqual(mockProject);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        include: {
          vm: true,
          source: true,
          networkConnections: true,
          services: true,
        },
      });
    });

    it('should return null when project not found', async () => {
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findProjectById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('generatePirateShipName', () => {
    it('should generate a pirate ship name', () => {
      const name = (repository as any).generatePirateShipName();

      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should generate different names on multiple calls', () => {
      const names = Array.from({ length: 10 }, () =>
        (repository as any).generatePirateShipName(),
      );

      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBeGreaterThan(1);
    });
  });

  describe('createProject', () => {
    it('should create a project with all required fields', async () => {
      const createProjectDto: CreateProjectDto = {
        vm_memory: 1024,
        vm_disk: 256,
        vm_cpus: 2,
        source: {} as any,
      };

      const createdProject = { ...mockProject, name: 'Generated Name' };
      (prismaService.project.create as jest.Mock).mockResolvedValue(
        createdProject,
      );

      const result = await repository.createProject(
        createProjectDto,
        'source-1',
      );

      expect(result).toEqual(createdProject);
      expect(prismaService.project.create).toHaveBeenCalled();
      const createCall = (prismaService.project.create as jest.Mock).mock
        .calls[0][0];
      expect(createCall.data.name).toBeDefined();
      expect(createCall.data.vm.create).toEqual({
        memory: 1024,
        disk: 256,
        cpus: 2,
        provider: 'libvirt',
      });
      expect(createCall.data.source.connect).toEqual({ id: 'source-1' });
    });

    it('should create a project with workspace when workspace_id is provided', async () => {
      const createProjectDto: CreateProjectDto = {
        vm_memory: 2048,
        vm_disk: 512,
        vm_cpus: 4,
        source: {} as any,
        workspace_id: 'workspace-1',
      };

      const createdProject = { ...mockProject, name: 'Generated Name' };
      (prismaService.project.create as jest.Mock).mockResolvedValue(
        createdProject,
      );

      const result = await repository.createProject(
        createProjectDto,
        'source-1',
      );

      expect(result).toEqual(createdProject);
      const createCall = (prismaService.project.create as jest.Mock).mock
        .calls[0][0];
      expect(createCall.data.workspace.connect).toEqual({ id: 'workspace-1' });
    });

    it('should create a project without workspace when workspace_id is undefined', async () => {
      const createProjectDto: CreateProjectDto = {
        vm_memory: 1024,
        vm_disk: 256,
        vm_cpus: 2,
        source: {} as any,
      };

      const createdProject = { ...mockProject, name: 'Generated Name' };
      (prismaService.project.create as jest.Mock).mockResolvedValue(
        createdProject,
      );

      const result = await repository.createProject(
        createProjectDto,
        'source-1',
      );

      expect(result).toEqual(createdProject);
      const createCall = (prismaService.project.create as jest.Mock).mock
        .calls[0][0];
      expect(createCall.data.workspace).toBeUndefined();
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedProject = { ...mockProject, ...updateData };
      (prismaService.project.update as jest.Mock).mockResolvedValue(
        updatedProject,
      );

      const result = await repository.updateProject({
        where: { id: 'project-1' },
        data: updateData,
      });

      expect(result).toEqual(updatedProject);
      expect(prismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: updateData,
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      (prismaService.project.delete as jest.Mock).mockResolvedValue(
        mockProject,
      );

      const result = await repository.deleteProject('project-1');

      expect(result).toEqual(mockProject);
      expect(prismaService.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
    });
  });

  describe('addServiceToProject', () => {
    it('should add a service to a project', async () => {
      const serviceDto: ServiceDto = {
        name: 'test-service',
        image: 'nginx:latest',
        ports: ['80:80'],
        networks: ['network1'],
        depends_on: [],
        environment: { KEY: 'value' },
        user: null,
        deployment: null,
      };

      const updatedProject = { ...mockProject, services: [mockService] };
      (prismaService.project.update as jest.Mock).mockResolvedValue(
        updatedProject,
      );

      const result = await repository.addServiceToProject(
        'project-1',
        serviceDto,
      );

      expect(result).toEqual(updatedProject);
      expect(prismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          services: {
            create: {
              ...serviceDto,
              environment: JSON.stringify(serviceDto.environment),
              user: JSON.stringify(serviceDto.user),
              deployment: JSON.stringify(serviceDto.deployment),
            },
          },
        },
      });
    });
  });

  describe('setServicesToProject', () => {
    it('should set services to a project', async () => {
      const services: ServiceDto[] = [
        {
          name: 'service-1',
          image: 'nginx:latest',
          ports: [],
          networks: [],
          depends_on: [],
          environment: {},
          user: null,
          deployment: null,
        },
        {
          name: 'service-2',
          image: 'redis:latest',
          ports: [],
          networks: [],
          depends_on: [],
          environment: {},
          user: null,
          deployment: null,
        },
      ];

      const mockTransaction = jest.fn(async (callback) => {
        const tx = {
          service: {
            deleteMany: jest.fn().mockResolvedValue({}),
            createMany: jest.fn().mockResolvedValue({}),
          },
          project: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'project-1',
              services: [mockService],
            }),
          },
        };
        return callback(tx);
      });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        mockTransaction,
      );

      const result = await repository.setServicesToProject(
        'project-1',
        services,
      );

      expect(result).toEqual([mockService]);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle empty services array', async () => {
      const mockTransaction = jest.fn(async (callback) => {
        const tx = {
          service: {
            deleteMany: jest.fn().mockResolvedValue({}),
            createMany: jest.fn().mockResolvedValue({}),
          },
          project: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'project-1',
              services: [],
            }),
          },
        };
        return callback(tx);
      });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        mockTransaction,
      );

      const result = await repository.setServicesToProject('project-1', []);

      expect(result).toEqual([]);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('removeServiceFromProject', () => {
    it('should remove a service from a project', async () => {
      const updatedProject = { ...mockProject };
      (prismaService.project.update as jest.Mock).mockResolvedValue(
        updatedProject,
      );

      const result = await repository.removeServiceFromProject(
        'project-1',
        'service-1',
      );

      expect(result).toEqual(updatedProject);
      expect(prismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          services: {
            delete: {
              id: 'service-1',
            },
          },
        },
      });
    });
  });

  describe('getProjectServices', () => {
    it('should return all services for a project', async () => {
      const services = [mockService];
      (prismaService.service.findMany as jest.Mock).mockResolvedValue(services);

      const result = await repository.getProjectServices('project-1');

      expect(result).toEqual(services);
      expect(prismaService.service.findMany).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
      });
    });

    it('should return empty array when no services exist', async () => {
      (prismaService.service.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.getProjectServices('project-1');

      expect(result).toEqual([]);
    });
  });

  describe('getProjectService', () => {
    it('should return a service by id', async () => {
      (prismaService.service.findFirst as jest.Mock).mockResolvedValue(
        mockService,
      );

      const result = await repository.getProjectService(
        'project-1',
        'service-1',
      );

      expect(result).toEqual(mockService);
      expect(prismaService.service.findFirst).toHaveBeenCalledWith({
        where: {
          projectId: 'project-1',
          id: 'service-1',
        },
      });
    });

    it('should return null when service not found', async () => {
      (prismaService.service.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.getProjectService(
        'project-1',
        'non-existent',
      );

      expect(result).toBeNull();
    });
  });

  describe('updateServiceStatus', () => {
    it('should update service status', async () => {
      const updatedProject = { ...mockProject };
      (prismaService.project.update as jest.Mock).mockResolvedValue(
        updatedProject,
      );

      await repository.updateServiceStatus(
        'project-1',
        'service-1',
        ServiceStatus.Running,
      );

      expect(prismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          services: {
            update: {
              where: { id: 'service-1' },
              data: {
                status: ServiceStatus.Running,
                statusTimeStamp: expect.any(Date),
              },
            },
          },
        },
      });
    });
  });

  describe('updateEnvironmentVars', () => {
    it('should update environment variables', async () => {
      const environmentVars: EnvironmentVar[] = [
        { key: 'KEY1', value: 'value1', isSecret: false },
        { key: 'KEY2', value: 'value2', isSecret: true },
      ];

      const updatedProject = { ...mockProject };
      (prismaService.project.update as jest.Mock).mockResolvedValue(
        updatedProject,
      );

      const result = await repository.updateEnvironmentVars(
        'project-1',
        environmentVars,
      );

      expect(result).toEqual(updatedProject);
      expect(prismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          environmentVars: {
            set: environmentVars,
          },
        },
      });
    });

    it('should handle empty environment variables array', async () => {
      const updatedProject = { ...mockProject };
      (prismaService.project.update as jest.Mock).mockResolvedValue(
        updatedProject,
      );

      const result = await repository.updateEnvironmentVars('project-1', []);

      expect(result).toEqual(updatedProject);
      expect(prismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: {
          environmentVars: {
            set: [],
          },
        },
      });
    });
  });
});
