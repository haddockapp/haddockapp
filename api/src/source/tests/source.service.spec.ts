import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { SourceFactory } from '../source.factory';
import { SourceService } from '../source.service';
import { SourceRepository } from '../source.repository';
import {
  generateCreateSourceDto,
  generateSource,
  generateSourceDto,
  generateSourceFromDto,
} from './mocks/sources.mock';
import { SourceType } from '../dto/create-source.dto';
import { BullModule, getQueueToken } from '@nestjs/bull';

jest.mock('../source.factory');
export const mockPrismaService = {
  source: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SourceService', () => {
  let service: SourceService;
  let sourceFactory: jest.Mocked<SourceFactory>;
  let sourceRepository: jest.Mocked<SourceRepository>;
  let prismaService: typeof mockPrismaService;
  let deployQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceService,
        {
          provide: SourceRepository,
          useValue: {
            findById: jest.fn(),
            createSource: jest.fn(),
            delete: jest.fn(),
            updateSettings: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken('deploys'),
          useValue: { add: jest.fn() },
        },
        SourceFactory,
      ],
    }).compile();

    service = module.get(SourceService);
    sourceFactory = module.get(SourceFactory);
    sourceRepository = module.get(SourceRepository);
    prismaService = module.get(PrismaService);
    deployQueue = module.get(getQueueToken('deploys'));
  });

  describe('registerSource', () => {
    it('should register a new source', async () => {
      const createSourceDto = generateCreateSourceDto() as any;
      const sourceDto = generateSourceDto(createSourceDto);
      const createdSource = generateSourceFromDto(createSourceDto);

      sourceFactory.createSource = jest.fn().mockResolvedValue(sourceDto);
      sourceRepository.createSource.mockResolvedValue(createdSource as any);

      const result = await service.registerSource(createSourceDto);

      expect(result).toEqual({
        ...createdSource,
        environmentVars: sourceDto.environmentVars,
      });
      expect(sourceFactory.createSource).toHaveBeenCalledWith(createSourceDto);
      expect(sourceRepository.createSource).toHaveBeenCalledWith(sourceDto);
    });
  });

  describe('deploySource', () => {
    it('should add a deploy job for an existing source', async () => {
      const source = generateSource();

      sourceRepository.findById.mockResolvedValue(source as any);

      await service.deploySource(source.id);

      expect(sourceRepository.findById).toHaveBeenCalledWith(source.id);
      expect(deployQueue.add).toHaveBeenCalledWith('deploy', {
        source,
        startAfterDeploy: true,
      });
    });

    it('should throw a NotFoundException if the source does not exist', async () => {
      sourceRepository.findById.mockRejectedValue(
        new NotFoundException('Source not found'),
      );

      await expect(service.deploySource('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteSource', () => {
    it('should delete a source by id', async () => {
      const source = generateSource();

      sourceRepository.delete.mockResolvedValue();

      await service.deleteSource(source.id);

      expect(sourceRepository.delete).toHaveBeenCalledWith(source.id);
    });
  });

  describe('deploySource with flags', () => {
    it('should deploy source with startAfterDeploy flag', async () => {
      const source = generateSource();

      sourceRepository.findById.mockResolvedValue(source as any);

      await service.deploySource(source.id, true);

      expect(deployQueue.add).toHaveBeenCalledWith('deploy', {
        source,
        startAfterDeploy: true,
      });
    });

    it('should deploy source without starting', async () => {
      const source = generateSource();

      sourceRepository.findById.mockResolvedValue(source as any);

      await service.deploySource(source.id, false);

      expect(deployQueue.add).toHaveBeenCalledWith('deploy', {
        source,
        startAfterDeploy: false,
      });
    });
  });

  describe('deletePhysicalFiles', () => {
    it('should delete ZIP upload files', async () => {
      const source = generateSource();
      source.type = SourceType.ZIP_UPLOAD;
      source.project = { id: 'project-1' } as any;

      sourceRepository.findById.mockResolvedValue(source as any);

      await service.deletePhysicalFiles(source.id);

      expect(sourceRepository.findById).toHaveBeenCalled();
    });

    it('should handle GitHub source type', async () => {
      const source = generateSource();
      source.type = SourceType.GITHUB;

      sourceRepository.findById.mockResolvedValue(source as any);

      await service.deletePhysicalFiles(source.id);

      expect(sourceRepository.findById).toHaveBeenCalled();
    });
  });

  describe('getComposePath', () => {
    it('should return compose path for GitHub source', () => {
      const source = {
        type: SourceType.GITHUB,
        settings: {
          composePath: 'docker-compose.yml',
        },
      } as any;

      process.env.SOURCE_DIR = 'sources';

      const result = service.getComposePath(source);

      expect(result).toBe('./sources/docker-compose.yml');
    });

    it('should return compose path for ZIP upload source', () => {
      const source = {
        type: SourceType.ZIP_UPLOAD,
        settings: {
          composePath: 'compose.yml',
        },
      } as any;

      process.env.SOURCE_DIR = 'sources';

      const result = service.getComposePath(source);

      expect(result).toBe('./sources/compose.yml');
    });

    it('should return compose path for template source', () => {
      const source = {
        type: SourceType.TEMPLATE,
        settings: {
          composePath: 'template-compose.yml',
        },
      } as any;

      process.env.SOURCE_DIR = 'sources';

      const result = service.getComposePath(source);

      process.env.SOURCE_DIR = 'sources';
      expect(result).toBe('./sources/template-compose.yml');
    });

    it('should throw error for unknown source type', () => {
      const source = {
        type: 'UNKNOWN',
        settings: {},
      } as any;

      expect(() => service.getComposePath(source)).toThrow(
        'Unknown source type',
      );
    });
  });

  describe('findSourceById', () => {
    it('should find source by id', async () => {
      const source = generateSource();

      sourceRepository.findById.mockResolvedValue(source as any);

      const result = await service.findSourceById(source.id);

      expect(result).toEqual(source);
      expect(sourceRepository.findById).toHaveBeenCalledWith(source.id);
    });
  });

  describe('updateSourceSettings', () => {
    it('should update source settings', async () => {
      const source = generateSource();
      const updateData = { composePath: 'new-compose.yml' };

      sourceRepository.updateSettings.mockResolvedValue(source as any);

      const result = await service.updateSourceSettings(source.id, updateData);

      expect(result).toEqual(source);
      expect(sourceRepository.updateSettings).toHaveBeenCalledWith(
        source.id,
        updateData,
      );
    });
  });
});
