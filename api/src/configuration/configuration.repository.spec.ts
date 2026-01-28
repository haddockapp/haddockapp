import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationRepository } from './configuration.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('ConfigurationRepository', () => {
  let repository: ConfigurationRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockConfiguration = {
    id: 'config-1',
    key: 'test-key',
    value: { setting: 'test-value' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationRepository,
        {
          provide: PrismaService,
          useValue: {
            appConfiguration: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<ConfigurationRepository>(ConfigurationRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createConfiguration', () => {
    it('should create a new configuration', async () => {
      (prismaService.appConfiguration.create as jest.Mock).mockResolvedValue(
        mockConfiguration,
      );

      const result = await repository.createConfiguration('test-key', {
        setting: 'test-value',
      });

      expect(result).toEqual(mockConfiguration);
      expect(prismaService.appConfiguration.create).toHaveBeenCalledWith({
        data: {
          key: 'test-key',
          value: { setting: 'test-value' },
        },
      });
    });
  });

  describe('getConfiguration', () => {
    it('should return all configurations', async () => {
      const configurations = [mockConfiguration];
      (prismaService.appConfiguration.findMany as jest.Mock).mockResolvedValue(
        configurations,
      );

      const result = await repository.getConfiguration();

      expect(result).toEqual(configurations);
      expect(prismaService.appConfiguration.findMany).toHaveBeenCalled();
    });
  });

  describe('getConfigurationByKey', () => {
    it('should return a configuration by key', async () => {
      (prismaService.appConfiguration.findFirst as jest.Mock).mockResolvedValue(
        mockConfiguration,
      );

      const result = await repository.getConfigurationByKey('test-key');

      expect(result).toEqual(mockConfiguration);
      expect(prismaService.appConfiguration.findFirst).toHaveBeenCalledWith({
        where: { key: 'test-key' },
      });
    });

    it('should return null when configuration not found', async () => {
      (prismaService.appConfiguration.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await repository.getConfigurationByKey('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getConfigurationByKeys', () => {
    it('should return configurations by multiple keys', async () => {
      const configurations = [mockConfiguration];
      (prismaService.appConfiguration.findMany as jest.Mock).mockResolvedValue(
        configurations,
      );

      const result = await repository.getConfigurationByKeys([
        'test-key',
        'other-key',
      ]);

      expect(result).toEqual(configurations);
      expect(prismaService.appConfiguration.findMany).toHaveBeenCalledWith({
        where: {
          key: {
            in: ['test-key', 'other-key'],
          },
        },
      });
    });
  });

  describe('updateConfiguration', () => {
    it('should update a configuration', async () => {
      const updatedConfig = {
        ...mockConfiguration,
        value: { setting: 'updated-value' },
      };
      (prismaService.appConfiguration.update as jest.Mock).mockResolvedValue(
        updatedConfig,
      );

      const result = await repository.updateConfiguration('test-key', {
        setting: 'updated-value',
      });

      expect(result).toEqual(updatedConfig);
      expect(prismaService.appConfiguration.update).toHaveBeenCalledWith({
        where: { key: 'test-key' },
        data: { value: { setting: 'updated-value' } },
      });
    });
  });
});
