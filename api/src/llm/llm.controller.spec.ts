import { Test, TestingModule } from '@nestjs/testing';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

describe('LlmController', () => {
  let controller: LlmController;
  let service: jest.Mocked<LlmService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [
        {
          provide: LlmService,
          useValue: {
            buildLlmsTxt: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LlmController>(LlmController);
    service = module.get(LlmService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLlmsTxt', () => {
    it('should return llms.txt content', async () => {
      const mockContent =
        'Domains: example.com\nBase URL: https://api.example.com';
      service.buildLlmsTxt.mockResolvedValue(mockContent);

      const result = await controller.getLlmsTxt();

      expect(result).toBe(mockContent);
      expect(service.buildLlmsTxt).toHaveBeenCalled();
    });

    it('should set correct Content-Type header', async () => {
      const mockContent = 'Domains: example.com';
      service.buildLlmsTxt.mockResolvedValue(mockContent);

      await controller.getLlmsTxt();

      expect(service.buildLlmsTxt).toHaveBeenCalled();
    });

    it('should handle empty content', async () => {
      service.buildLlmsTxt.mockResolvedValue('');

      const result = await controller.getLlmsTxt();

      expect(result).toBe('');
    });
  });
});
