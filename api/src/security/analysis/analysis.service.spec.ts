import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ProjectFileIndexService } from '../helpers/project-file-index.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SECURITY_ANALYZERS, SECURITY_RULES } from '../security.tokens';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let prismaService: jest.Mocked<PrismaService>;
  let fileIndexService: jest.Mocked<ProjectFileIndexService>;

  const mockProject = {
    id: 'project-1',
    path: '/workspaces/project-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ProjectFileIndexService,
          useValue: {
            build: jest.fn(),
          },
        },
        {
          provide: SECURITY_ANALYZERS,
          useValue: [],
        },
        {
          provide: SECURITY_RULES,
          useValue: [],
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    prismaService = module.get(PrismaService);
    fileIndexService = module.get(ProjectFileIndexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeProject', () => {
    it('should throw NotFoundException if project not found', async () => {
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.analyzeProject('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should analyze project with file index', async () => {
      const mockFileIndex = {
        root: '/workspaces/project-1',
        files: new Map(),
      };

      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(
        mockProject as any,
      );
      fileIndexService.build.mockResolvedValue(mockFileIndex as any);

      const result = await service.analyzeProject('project-1');

      expect(result).toEqual([]);
      expect(fileIndexService.build).toHaveBeenCalled();
    });

    it('should handle project without path', async () => {
      const projectWithoutPath = {
        ...mockProject,
        path: undefined,
      };

      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(
        projectWithoutPath as any,
      );

      const result = await service.analyzeProject('project-1');

      expect(result).toEqual([]);
      expect(fileIndexService.build).not.toHaveBeenCalled();
    });
  });
});
