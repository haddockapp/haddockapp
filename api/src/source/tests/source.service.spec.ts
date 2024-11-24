import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { SourceFactory } from '../source.factory';
import { SourceService } from '../source.service';
import { generateCreateSourceDto, generateSource, generateSourceDto, generateSourceFromDto } from './mocks/sources.mock';
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
  let prismaService: typeof mockPrismaService;
  let deployQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceService,
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
    prismaService = module.get(PrismaService);
    deployQueue = module.get(getQueueToken('deploys'));
  });

  describe('registerSource', () => {
    it('should register a new source', async () => {
      const createSourceDto = generateCreateSourceDto();
      const sourceDto = generateSourceDto(createSourceDto);
      const createdSource = generateSourceFromDto(createSourceDto);

      sourceFactory.createSource.mockReturnValue(sourceDto);
      prismaService.source.create.mockResolvedValue(createdSource);

      const result = await service.registerSource(createSourceDto);

      expect(result).toEqual(createdSource);
      expect(sourceFactory.createSource).toHaveBeenCalledWith(createSourceDto);
      expect(prismaService.source.create).toHaveBeenCalledWith({ data: sourceDto });
    });
  });

  describe('deploySource', () => {
    it('should add a deploy job for an existing source', async () => {
      const source = generateSource();

      prismaService.source.findUnique.mockResolvedValue(source);

      await service.deploySource(source.id);

      expect(prismaService.source.findUnique).toHaveBeenCalledWith({
        where: { id: source.id },
        include: { authorization: true, project: true },
      });
      expect(deployQueue.add).toHaveBeenCalledWith('deploy', source);
    });

    it('should throw a NotFoundException if the source does not exist', async () => {
      prismaService.source.findUnique.mockResolvedValue(null);

      await expect(service.deploySource('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSource', () => {
    it('should delete a source by id', async () => {
      const source = generateSource();

      prismaService.source.delete.mockResolvedValue(source);

      const result = await service.deleteSource(source.id);

      expect(result).toEqual(source);
      expect(prismaService.source.delete).toHaveBeenCalledWith({
        where: { id: source.id },
      });
    });
  });
});
