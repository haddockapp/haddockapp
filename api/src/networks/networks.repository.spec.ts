import { Test, TestingModule } from '@nestjs/testing';
import { NetworksRepository } from './networks.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNetworkConnectionDto } from './dto/CreateNetworkConnectionDto';
import { UpdateNetworkConnectionDto } from './dto/UpdateNetworkConnectionDto';

describe('NetworksRepository', () => {
  let repository: NetworksRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockNetworkConnection = {
    id: 'network-1',
    domain: 'test.example.com',
    port: 80,
    projectId: 'project-1',
    https: false,
  };

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetworksRepository,
        {
          provide: PrismaService,
          useValue: {
            networkConnection: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            project: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<NetworksRepository>(NetworksRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findNetworkConnections', () => {
    it('should return all network connections', async () => {
      const connections = [mockNetworkConnection];
      (prismaService.networkConnection.findMany as jest.Mock).mockResolvedValue(
        connections,
      );

      const result = await repository.findNetworkConnections();

      expect(result).toEqual(connections);
      expect(prismaService.networkConnection.findMany).toHaveBeenCalled();
    });
  });

  describe('findNetworkConnectionsByProjectId', () => {
    it('should return network connections for a project', async () => {
      const connections = [mockNetworkConnection];
      (prismaService.networkConnection.findMany as jest.Mock).mockResolvedValue(
        connections,
      );

      const result =
        await repository.findNetworkConnectionsByProjectId('project-1');

      expect(result).toEqual(connections);
      expect(prismaService.networkConnection.findMany).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
      });
    });
  });

  describe('findNetworkConnectionsAndProjectAndVm', () => {
    it('should return network connections with project and vm', async () => {
      const connections = [
        {
          ...mockNetworkConnection,
          project: {
            ...mockProject,
            vm: { id: 'vm-1' },
          },
        },
      ];
      (prismaService.networkConnection.findMany as jest.Mock).mockResolvedValue(
        connections,
      );

      const result = await repository.findNetworkConnectionsAndProjectAndVm();

      expect(result).toEqual(connections);
      expect(prismaService.networkConnection.findMany).toHaveBeenCalledWith({
        include: {
          project: {
            include: {
              vm: true,
            },
          },
        },
      });
    });
  });

  describe('findNetworkConnectionById', () => {
    it('should return a network connection by id', async () => {
      (
        prismaService.networkConnection.findUnique as jest.Mock
      ).mockResolvedValue(mockNetworkConnection);

      const result = await repository.findNetworkConnectionById('network-1');

      expect(result).toEqual(mockNetworkConnection);
      expect(prismaService.networkConnection.findUnique).toHaveBeenCalledWith({
        where: { id: 'network-1' },
      });
    });
  });

  describe('createNetworkConnection', () => {
    it('should create a new network connection', async () => {
      const createDto: CreateNetworkConnectionDto = {
        projectId: 'project-1',
        prefix: 'test',
        port: 80,
        domainId: 'domain-1',
      };

      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject,
      );
      (prismaService.networkConnection.create as jest.Mock).mockResolvedValue(
        mockNetworkConnection,
      );

      const result = await repository.createNetworkConnection(
        createDto,
        'example.com',
        false,
      );

      expect(result).toEqual(mockNetworkConnection);
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
      expect(prismaService.networkConnection.create).toHaveBeenCalledWith({
        data: {
          domain: 'test.example.com',
          port: 80,
          projectId: 'project-1',
          https: false,
        },
      });
    });
  });

  describe('updateNetworkConnection', () => {
    it('should update a network connection', async () => {
      const updateDto: UpdateNetworkConnectionDto = {
        port: 443,
        domain: 'updated.example.com',
      };

      const updatedConnection = { ...mockNetworkConnection, ...updateDto };
      (prismaService.networkConnection.update as jest.Mock).mockResolvedValue(
        updatedConnection,
      );

      const result = await repository.updateNetworkConnection(
        'network-1',
        updateDto,
      );

      expect(result).toEqual(updatedConnection);
      expect(prismaService.networkConnection.update).toHaveBeenCalledWith({
        where: { id: 'network-1' },
        data: updateDto,
      });
    });
  });

  describe('deleteNetworkConnection', () => {
    it('should delete a network connection', async () => {
      (prismaService.networkConnection.delete as jest.Mock).mockResolvedValue(
        mockNetworkConnection,
      );

      const result = await repository.deleteNetworkConnection('network-1');

      expect(result).toEqual(mockNetworkConnection);
      expect(prismaService.networkConnection.delete).toHaveBeenCalledWith({
        where: { id: 'network-1' },
      });
    });
  });
});
