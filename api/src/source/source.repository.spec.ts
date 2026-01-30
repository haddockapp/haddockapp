import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SourceRepository } from './source.repository';
import { PrismaService } from '../prisma/prisma.service';
import { SourceDto, PersistedSourceDto } from './dto/source.dto';
import { SourceType } from './dto/create-source.dto';
import { GithubSourceSettingsDto } from './dto/settings.dto';

describe('SourceRepository', () => {
  let repository: SourceRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockSource: PersistedSourceDto = {
    id: 'source-1',
    type: SourceType.GITHUB,
    settings: {
      organization: 'test-org',
      repository: 'test-repo',
      branch: 'main',
      composePath: 'docker-compose.yml',
    } as any,
    authorizationId: 'auth-1',
    authorization: {
      id: 'auth-1',
      type: 'OAUTH',
      data: {},
    } as any,
    project: {
      id: 'project-1',
    } as any,
  };

  const mockSourceDto: SourceDto = {
    type: SourceType.GITHUB,
    settings: {
      organization: 'test-org',
      repository: 'test-repo',
      branch: 'main',
      composePath: 'docker-compose.yml',
    } as any,
    authorizationId: 'auth-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceRepository,
        {
          provide: PrismaService,
          useValue: {
            source: {
              findUniqueOrThrow: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<SourceRepository>(SourceRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a source by id', async () => {
      (prismaService.source.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        mockSource,
      );

      const result = await repository.findById('source-1');

      expect(result).toEqual(mockSource);
      expect(prismaService.source.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'source-1' },
        include: {
          authorization: true,
          project: true,
        },
      });
    });

    it('should throw error when source not found', async () => {
      const error = new Error('Source not found');
      (prismaService.source.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        error,
      );

      await expect(repository.findById('non-existent')).rejects.toThrow(error);
    });
  });

  describe('createSource', () => {
    it('should create a source with authorization', async () => {
      const createdSource = {
        id: 'source-1',
        type: SourceType.GITHUB,
        settings: mockSourceDto.settings,
        authorizationId: 'auth-1',
      };

      (prismaService.source.create as jest.Mock).mockResolvedValue(
        createdSource,
      );

      const result = await repository.createSource(mockSourceDto);

      expect(result).toEqual(createdSource);
      expect(prismaService.source.create).toHaveBeenCalledWith({
        data: {
          type: SourceType.GITHUB,
          settings: mockSourceDto.settings,
          authorization: {
            connect: { id: 'auth-1' },
          },
        },
      });
    });

    it('should create a source without authorization when authorizationId is null', async () => {
      const sourceDtoWithoutAuth: SourceDto = {
        ...mockSourceDto,
        authorizationId: null,
      };

      const createdSource = {
        id: 'source-1',
        type: SourceType.GITHUB,
        settings: sourceDtoWithoutAuth.settings,
        authorizationId: null,
      };

      (prismaService.source.create as jest.Mock).mockResolvedValue(
        createdSource,
      );

      const result = await repository.createSource(sourceDtoWithoutAuth);

      expect(result).toEqual(createdSource);
      expect(prismaService.source.create).toHaveBeenCalledWith({
        data: {
          type: SourceType.GITHUB,
          settings: sourceDtoWithoutAuth.settings,
          authorization: undefined,
        },
      });
    });

    it('should create a source without authorization when authorizationId is undefined', async () => {
      const sourceDtoWithoutAuth: SourceDto = {
        ...mockSourceDto,
        authorizationId: undefined,
      };

      const createdSource = {
        id: 'source-1',
        type: SourceType.GITHUB,
        settings: sourceDtoWithoutAuth.settings,
        authorizationId: null,
      };

      (prismaService.source.create as jest.Mock).mockResolvedValue(
        createdSource,
      );

      const result = await repository.createSource(sourceDtoWithoutAuth);

      expect(result).toEqual(createdSource);
      expect(prismaService.source.create).toHaveBeenCalledWith({
        data: {
          type: SourceType.GITHUB,
          settings: sourceDtoWithoutAuth.settings,
          authorization: undefined,
        },
      });
    });
  });

  describe('updateSettings', () => {
    it('should update source settings', async () => {
      const existingSource = {
        settings: {
          organization: 'test-org',
          repository: 'test-repo',
          branch: 'main',
          composePath: 'docker-compose.yml',
        },
      };

      const updateData = {
        branch: 'develop',
      };

      const updatedSource = {
        id: 'source-1',
        settings: {
          ...existingSource.settings,
          ...updateData,
        },
      };

      (prismaService.source.findUnique as jest.Mock).mockResolvedValue(
        existingSource,
      );
      (prismaService.source.update as jest.Mock).mockResolvedValue(
        updatedSource,
      );

      const result = await repository.updateSettings('source-1', updateData);

      expect(result).toEqual(updatedSource);
      expect(prismaService.source.findUnique).toHaveBeenCalledWith({
        where: { id: 'source-1' },
        select: { settings: true },
      });
      expect(prismaService.source.update).toHaveBeenCalledWith({
        where: { id: 'source-1' },
        data: {
          settings: {
            organization: 'test-org',
            repository: 'test-repo',
            branch: 'develop',
            composePath: 'docker-compose.yml',
          },
        },
      });
    });

    it('should throw NotFoundException when source not found', async () => {
      (prismaService.source.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        repository.updateSettings('non-existent', { branch: 'develop' }),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.source.update).not.toHaveBeenCalled();
    });

    it('should merge settings correctly', async () => {
      const existingSource = {
        settings: {
          organization: 'test-org',
          repository: 'test-repo',
          branch: 'main',
          composePath: 'docker-compose.yml',
        },
      };

      const updateData = {
        organization: 'new-org',
        branch: 'feature-branch',
      };

      const updatedSource = {
        id: 'source-1',
        settings: {
          ...existingSource.settings,
          ...updateData,
        },
      };

      (prismaService.source.findUnique as jest.Mock).mockResolvedValue(
        existingSource,
      );
      (prismaService.source.update as jest.Mock).mockResolvedValue(
        updatedSource,
      );

      const result = await repository.updateSettings('source-1', updateData);

      expect(result).toEqual(updatedSource);
      expect(prismaService.source.update).toHaveBeenCalledWith({
        where: { id: 'source-1' },
        data: {
          settings: {
            organization: 'new-org',
            repository: 'test-repo',
            branch: 'feature-branch',
            composePath: 'docker-compose.yml',
          },
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete a source', async () => {
      (prismaService.source.delete as jest.Mock).mockResolvedValue(mockSource);

      await repository.delete('source-1');

      expect(prismaService.source.delete).toHaveBeenCalledWith({
        where: { id: 'source-1' },
      });
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Deletion failed');
      (prismaService.source.delete as jest.Mock).mockRejectedValue(error);

      await expect(repository.delete('source-1')).rejects.toThrow(error);
    });
  });
});
