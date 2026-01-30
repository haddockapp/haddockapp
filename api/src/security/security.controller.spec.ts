import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SecurityController } from './security.controller';
import { AnalysisService } from './analysis/analysis.service';

describe('SecurityController', () => {
  let controller: SecurityController;
  let analysisService: jest.Mocked<AnalysisService>;
  let cache: jest.Mocked<any>;

  const mockFindings = [
    {
      type: 'vulnerability',
      severity: 'high',
      message: 'Test finding',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [
        {
          provide: AnalysisService,
          useValue: {
            analyzeProject: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SecurityController>(SecurityController);
    analysisService = module.get(AnalysisService);
    cache = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyze', () => {
    it('should analyze project and cache findings', async () => {
      analysisService.analyzeProject.mockResolvedValue(mockFindings as any);
      cache.set.mockResolvedValue(undefined);

      const result = await controller.analyze('project-1');

      expect(result).toEqual({ success: true });
      expect(analysisService.analyzeProject).toHaveBeenCalledWith('project-1');
      expect(cache.set).toHaveBeenCalledWith(
        'security:findings:project-1',
        mockFindings,
      );
    });
  });

  describe('getFindings', () => {
    it('should return cached findings', async () => {
      cache.get.mockResolvedValue(mockFindings);

      const result = await controller.getFindings('project-1');

      expect(result.findings).toEqual(mockFindings);
      expect(cache.get).toHaveBeenCalledWith('security:findings:project-1');
      expect(analysisService.analyzeProject).not.toHaveBeenCalled();
    });

    it('should analyze and cache if findings not in cache', async () => {
      cache.get.mockResolvedValue(null);
      analysisService.analyzeProject.mockResolvedValue(mockFindings as any);
      cache.set.mockResolvedValue(undefined);

      const result = await controller.getFindings('project-1');

      expect(result.findings).toEqual(mockFindings);
      expect(analysisService.analyzeProject).toHaveBeenCalledWith('project-1');
      expect(cache.set).toHaveBeenCalled();
    });

    it('should return empty array if no findings', async () => {
      cache.get.mockResolvedValue(null);
      analysisService.analyzeProject.mockResolvedValue([]);

      const result = await controller.getFindings('project-1');

      expect(result.findings).toEqual([]);
    });
  });
});
