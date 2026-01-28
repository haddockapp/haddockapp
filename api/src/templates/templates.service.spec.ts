import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { TemplatesMapper } from './templates.mapper';
import { Version } from './types/template.type';

describe('TemplatesService', () => {
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplatesService, { provide: TemplatesMapper, useValue: {} }],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
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
        { key: 'BAR', label: 'Bar', type: 'plain', policy: 'generated' },
      ],
    };

    jest
      .spyOn(service as any, 'getTemplateVersion')
      .mockResolvedValue(fakeVersion);

    const result = await service.buildTemplateEnvironment('tpl', 'v1', {
      FOO: 'value',
    });

    expect(result).toEqual({
      FOO: 'value',
      BAR: expect.stringMatching(/^[A-Za-z0-9!@]{16,32}$/),
    });
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
});
