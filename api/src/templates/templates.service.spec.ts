import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { TemplatesMapper } from './templates.mapper';
import { Version } from './types/template.type';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let mapper: jest.Mocked<TemplatesMapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: TemplatesMapper,
          useValue: {
            toResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    mapper = module.get(TemplatesMapper);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('buildTemplateEnvironment builds env with inputs and generated variables', async () => {
    const fakeVersion: Version = {
      id: 'v1',
      label: 'Version 1',
      compose: 'compose.yml',
      path: 'path/to/version',
      env: [
        { key: 'FOO', label: 'Foo', type: 'plain', policy: 'input' },
        { key: 'BAR', label: 'Bar', type: 'plain', policy: 'generate' },
      ],
    };

    jest
      .spyOn(service as any, 'getTemplateVersion')
      .mockResolvedValue(fakeVersion);

    const result = await service.buildTemplateEnvironment('tpl', 'v1', {
      FOO: 'value',
    });

    expect(result).toHaveLength(2);
    const fooVar = result.find((v) => v.key === 'FOO');
    const barVar = result.find((v) => v.key === 'BAR');
    expect(fooVar?.value).toBe('value');
    expect(barVar?.value).toMatch(/^[A-Za-z0-9!@]{16,32}$/);
  });

  it('buildTemplateEnvironment throws when required input missing', async () => {
    const fakeVersion: Version = {
      id: 'v1',
      label: 'Version 1',
      compose: 'compose.yml',
      path: 'path/to/version',
      env: [
        { key: 'FOO', label: 'Foo', type: 'plain', policy: 'input' },
        { key: 'BAR', label: 'Bar', type: 'plain', policy: 'input' },
      ],
    };

    jest
      .spyOn(service as any, 'getTemplateVersion')
      .mockResolvedValue(fakeVersion);

    const result = service.buildTemplateEnvironment('tpl', 'v1', {
      FOO: 'value',
    });

    await expect(result).rejects.toThrow(
      'Missing required environment variable: BAR',
    );
  });

  it('buildTemplateEnvironment handles empty env array', async () => {
    const fakeVersion: Version = {
      id: 'v1',
      label: 'Version 1',
      compose: 'compose.yml',
      path: 'path/to/version',
      env: [],
    };

    jest
      .spyOn(service as any, 'getTemplateVersion')
      .mockResolvedValue(fakeVersion);

    const result = await service.buildTemplateEnvironment('tpl', 'v1', {});

    expect(result).toEqual([]);
  });

  it('buildTemplateEnvironment handles only generated variables', async () => {
    const fakeVersion: Version = {
      id: 'v1',
      label: 'Version 1',
      compose: 'compose.yml',
      path: 'path/to/version',
      env: [
        { key: 'SECRET', label: 'Secret', type: 'plain', policy: 'generate' },
      ],
    };

    jest
      .spyOn(service as any, 'getTemplateVersion')
      .mockResolvedValue(fakeVersion);

    const result = await service.buildTemplateEnvironment('tpl', 'v1', {});

    expect(result).toHaveLength(1);
    const secretVar = result.find((v) => v.key === 'SECRET');
    expect(secretVar).toBeDefined();
    expect(secretVar?.value).toMatch(/^[A-Za-z0-9!@]{16,32}$/);
  });

  it('buildTemplateEnvironment handles multiple input variables', async () => {
    const fakeVersion: Version = {
      id: 'v1',
      label: 'Version 1',
      compose: 'compose.yml',
      path: 'path/to/version',
      env: [
        { key: 'VAR1', label: 'Var 1', type: 'plain', policy: 'input' },
        { key: 'VAR2', label: 'Var 2', type: 'plain', policy: 'input' },
      ],
    };

    jest
      .spyOn(service as any, 'getTemplateVersion')
      .mockResolvedValue(fakeVersion);

    const result = await service.buildTemplateEnvironment('tpl', 'v1', {
      VAR1: 'value1',
      VAR2: 'value2',
    });

    expect(result).toHaveLength(2);
    const var1 = result.find((v) => v.key === 'VAR1');
    const var2 = result.find((v) => v.key === 'VAR2');
    expect(var1?.value).toBe('value1');
    expect(var2?.value).toBe('value2');
  });

  it('buildTemplateEnvironment throws when template version not found', async () => {
    jest.spyOn(service as any, 'getTemplateVersion').mockResolvedValue(null);

    await expect(
      service.buildTemplateEnvironment('tpl', 'v1', {}),
    ).rejects.toThrow('Template version not found');
  });

  it('buildTemplateEnvironment handles mixed input and generated variables', async () => {
    const fakeVersion: Version = {
      id: 'v1',
      label: 'Version 1',
      compose: 'compose.yml',
      path: 'path/to/version',
      env: [
        { key: 'INPUT_VAR', label: 'Input', type: 'plain', policy: 'input' },
        {
          key: 'GENERATED_VAR',
          label: 'Generated',
          type: 'plain',
          policy: 'generate',
        },
      ],
    };

    jest
      .spyOn(service as any, 'getTemplateVersion')
      .mockResolvedValue(fakeVersion);

    const result = await service.buildTemplateEnvironment('tpl', 'v1', {
      INPUT_VAR: 'input-value',
    });

    expect(result).toHaveLength(2);
    const inputVar = result.find((v) => v.key === 'INPUT_VAR');
    const generatedVar = result.find((v) => v.key === 'GENERATED_VAR');
    expect(inputVar?.value).toBe('input-value');
    expect(generatedVar?.value).toMatch(/^[A-Za-z0-9!@]{16,32}$/);
  });

  describe('listTemplates', () => {
    it('should return list of templates', async () => {
      const mockTemplates = [
        { id: 'tpl1', name: 'Template 1' },
        { id: 'tpl2', name: 'Template 2' },
      ];
      const mockResponse = { data: mockTemplates };
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockResolvedValue(mockResponse);
      mapper.toResponse.mockImplementation((t) => t as any);

      const result = await service.listTemplates();

      expect(result).toHaveLength(2);
      expect(axios.get).toHaveBeenCalled();
    });
  });

  describe('getTemplateVersion', () => {
    it('should return template version', async () => {
      const mockTemplate = {
        id: 'tpl1',
        versions: [{ id: 'v1', label: 'Version 1' }],
      };
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: [mockTemplate],
      });

      const result = await (service as any).getTemplateVersion('tpl1', 'v1');

      expect(result).toEqual({ id: 'v1', label: 'Version 1' });
    });

    it('should return null if template not found', async () => {
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockResolvedValue({ data: [] });

      const result = await (service as any).getTemplateVersion('tpl1', 'v1');

      expect(result).toBeNull();
    });

    it('should return null if version not found', async () => {
      const mockTemplate = {
        id: 'tpl1',
        versions: [{ id: 'v1', label: 'Version 1' }],
      };
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: [mockTemplate],
      });

      const result = await (service as any).getTemplateVersion('tpl1', 'v2');

      expect(result).toBeNull();
    });
  });
});
