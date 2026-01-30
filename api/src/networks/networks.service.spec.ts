import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { NetworksRepository } from './networks.repository';
import { CaddyService } from '../caddy/caddy.service';
import { DomainRepository } from '../domains/domains.repository';
import { CreateNetworkConnectionDto } from './dto/CreateNetworkConnectionDto';
import { UpdateNetworkConnectionDto } from './dto/UpdateNetworkConnectionDto';

describe('NetworksService', () => {
  let service: NetworksService;
  let networksRepository: jest.Mocked<NetworksRepository>;
  let caddyService: jest.Mocked<CaddyService>;
  let domainRepository: jest.Mocked<DomainRepository>;

  const mockDomain = {
    id: 'domain-1',
    domain: 'example.com',
    main: true,
    https: true,
  };

  const mockNetworkConnection = {
    id: 'network-1',
    domain: 'example.com',
    prefix: 'app',
    port: 8080,
    https: true,
    project: {
      id: 'project-1',
      vm: {
        ip: '192.168.1.1',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetworksService,
        {
          provide: NetworksRepository,
          useValue: {
            findNetworkConnectionsAndProjectAndVm: jest.fn(),
            createNetworkConnection: jest.fn(),
            updateNetworkConnection: jest.fn(),
            deleteNetworkConnection: jest.fn(),
          },
        },
        {
          provide: CaddyService,
          useValue: {
            generate: jest.fn(),
          },
        },
        {
          provide: DomainRepository,
          useValue: {
            findDomainById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NetworksService>(NetworksService);
    networksRepository = module.get(NetworksRepository);
    caddyService = module.get(CaddyService);
    domainRepository = module.get(DomainRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateNetworksfile', () => {
    it('should update networks file with all connections', async () => {
      const connections = [mockNetworkConnection];
      networksRepository.findNetworkConnectionsAndProjectAndVm.mockResolvedValue(
        connections as any,
      );
      caddyService.generate.mockResolvedValue();

      await service.updateNetworksfile();

      expect(
        networksRepository.findNetworkConnectionsAndProjectAndVm,
      ).toHaveBeenCalled();
      expect(caddyService.generate).toHaveBeenCalledWith({
        template: 'reverse-proxies.hbs',
        data: {
          data: [
            {
              hostname: 'example.com',
              ip: '192.168.1.1',
              port: 8080,
            },
          ],
        },
        dest: expect.stringContaining('services.caddy'),
      });
    });

    it('should handle HTTP connections correctly', async () => {
      const httpConnection = {
        ...mockNetworkConnection,
        https: false,
      };
      networksRepository.findNetworkConnectionsAndProjectAndVm.mockResolvedValue(
        [httpConnection] as any,
      );
      caddyService.generate.mockResolvedValue();

      await service.updateNetworksfile();

      expect(caddyService.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: [
              expect.objectContaining({
                hostname: 'http://example.com',
              }),
            ],
          }),
        }),
      );
    });
  });

  describe('createNetworkConnection', () => {
    it('should create network connection successfully', async () => {
      networksRepository.findNetworkConnectionsAndProjectAndVm.mockResolvedValue(
        [],
      );
      const createDto: CreateNetworkConnectionDto = {
        domainId: 'domain-1',
        projectId: 'project-1',
        port: 8080,
        prefix: 'app',
      };

      domainRepository.findDomainById.mockResolvedValue(mockDomain as any);
      networksRepository.createNetworkConnection.mockResolvedValue(
        mockNetworkConnection as any,
      );
      caddyService.generate.mockResolvedValue();

      const result = await service.createNetworkConnection(createDto);

      expect(result).toEqual(mockNetworkConnection);
      expect(domainRepository.findDomainById).toHaveBeenCalledWith('domain-1');
      expect(networksRepository.createNetworkConnection).toHaveBeenCalledWith(
        createDto,
        'example.com',
        true,
      );
      expect(caddyService.generate).toHaveBeenCalled();
    });

    it('should throw BadRequestException if domain does not exist', async () => {
      const createDto: CreateNetworkConnectionDto = {
        domainId: 'non-existent',
        projectId: 'project-1',
        port: 8080,
        prefix: 'app',
      };

      domainRepository.findDomainById.mockResolvedValue(null);

      await expect(service.createNetworkConnection(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(networksRepository.createNetworkConnection).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if prefix is "api" on main domain', async () => {
      const createDto: CreateNetworkConnectionDto = {
        domainId: 'domain-1',
        projectId: 'project-1',
        port: 8080,
        prefix: 'api',
      };

      domainRepository.findDomainById.mockResolvedValue(mockDomain as any);

      await expect(service.createNetworkConnection(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate domain format', async () => {
      const createDto: CreateNetworkConnectionDto = {
        domainId: 'domain-1',
        projectId: 'project-1',
        port: 8080,
        prefix: 'invalid-prefix-!',
      };

      domainRepository.findDomainById.mockResolvedValue(mockDomain as any);

      await expect(service.createNetworkConnection(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow valid domain prefixes', async () => {
      networksRepository.findNetworkConnectionsAndProjectAndVm.mockResolvedValue(
        [],
      );
      const createDto: CreateNetworkConnectionDto = {
        domainId: 'domain-1',
        projectId: 'project-1',
        port: 8080,
        prefix: 'myapp',
      };

      domainRepository.findDomainById.mockResolvedValue(mockDomain as any);
      networksRepository.createNetworkConnection.mockResolvedValue(
        mockNetworkConnection as any,
      );
      caddyService.generate.mockResolvedValue();

      await service.createNetworkConnection(createDto);

      expect(networksRepository.createNetworkConnection).toHaveBeenCalled();
    });
  });

  describe('updateNetworkConnection', () => {
    it('should update network connection successfully', async () => {
      networksRepository.findNetworkConnectionsAndProjectAndVm.mockResolvedValue(
        [],
      );
      const updateDto: UpdateNetworkConnectionDto = {
        domain: 'example.com',
        port: 9090,
      };

      networksRepository.updateNetworkConnection.mockResolvedValue({
        ...mockNetworkConnection,
        port: 9090,
      } as any);
      caddyService.generate.mockResolvedValue();

      const result = await service.updateNetworkConnection(
        'network-1',
        updateDto,
      );

      expect(result.port).toBe(9090);
      expect(networksRepository.updateNetworkConnection).toHaveBeenCalledWith(
        'network-1',
        updateDto,
      );
      expect(caddyService.generate).toHaveBeenCalled();
    });
  });

  describe('deleteNetworkConnection', () => {
    it('should delete network connection successfully', async () => {
      networksRepository.findNetworkConnectionsAndProjectAndVm.mockResolvedValue(
        [],
      );
      networksRepository.deleteNetworkConnection.mockResolvedValue({} as any);
      caddyService.generate.mockResolvedValue();

      await service.deleteNetworkConnection('network-1');

      expect(networksRepository.deleteNetworkConnection).toHaveBeenCalledWith(
        'network-1',
      );
      expect(caddyService.generate).toHaveBeenCalled();
    });
  });
});
