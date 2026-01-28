import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplatesMapper } from './templates.mapper';

describe('TemplatesController', () => {
  let controller: TemplatesController;
  let service: jest.Mocked<TemplatesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        {
          provide: TemplatesService,
          useValue: {
            listTemplates: jest.fn(),
          },
        },
        {
          provide: TemplatesMapper,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TemplatesController>(TemplatesController);
    service = module.get(TemplatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listProjects', () => {
    it('should return list of templates', async () => {
      const mockTemplates = [
        { id: 'tpl1', name: 'Template 1' },
        { id: 'tpl2', name: 'Template 2' },
      ];
      service.listTemplates.mockResolvedValue(mockTemplates as any);

      const result = await controller.listProjects();

      expect(result).toEqual(mockTemplates);
      expect(service.listTemplates).toHaveBeenCalled();
    });

    it('should return empty array when no templates', async () => {
      service.listTemplates.mockResolvedValue([]);

      const result = await controller.listProjects();

      expect(result).toEqual([]);
    });
  });
});
