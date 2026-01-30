import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';
import { DomainRepository } from '../domains/domains.repository';
import * as fs from 'node:fs';

jest.mock('node:fs');

describe('LlmService', () => {
  let service: LlmService;
  let domainRepository: jest.Mocked<DomainRepository>;

  const mockTemplate = 'Domains: {{domains}}\nBase URL: {{baseUrl}}';

  const mockDomains = [
    { id: '1', domain: 'example.com', main: true, https: true },
    { id: '2', domain: 'test.com', main: false, https: false },
  ];

  beforeEach(async () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(mockTemplate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: DomainRepository,
          useValue: {
            findAllDomains: jest.fn(),
            getMainDomain: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
    domainRepository = module.get(DomainRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableDomains', () => {
    it('should return list of domain names', async () => {
      domainRepository.findAllDomains.mockResolvedValue(mockDomains as any);

      const result = await service.getAvailableDomains();

      expect(result).toEqual(['example.com', 'test.com']);
      expect(domainRepository.findAllDomains).toHaveBeenCalled();
    });

    it('should return empty array when no domains exist', async () => {
      domainRepository.findAllDomains.mockResolvedValue([]);

      const result = await service.getAvailableDomains();

      expect(result).toEqual([]);
    });
  });

  describe('buildApiUrl', () => {
    it('should build HTTPS API URL for main domain', async () => {
      domainRepository.getMainDomain.mockResolvedValue(mockDomains[0] as any);

      const result = await service.buildApiUrl();

      expect(result).toBe('https://api.example.com');
      expect(domainRepository.getMainDomain).toHaveBeenCalled();
    });

    it('should build HTTP API URL for non-HTTPS main domain', async () => {
      const httpDomain = { ...mockDomains[1], main: true };
      domainRepository.getMainDomain.mockResolvedValue(httpDomain as any);

      const result = await service.buildApiUrl();

      expect(result).toBe('http://api.test.com');
    });
  });

  describe('buildLlmsTxt', () => {
    it('should build llms.txt content with domains and base URL', async () => {
      domainRepository.findAllDomains.mockResolvedValue(mockDomains as any);
      domainRepository.getMainDomain.mockResolvedValue(mockDomains[0] as any);

      const result = await service.buildLlmsTxt();

      expect(result).toContain('example.com, test.com');
      expect(result).toContain('https://api.example.com');
    });

    it('should handle empty domains list', async () => {
      domainRepository.findAllDomains.mockResolvedValue([]);
      domainRepository.getMainDomain.mockResolvedValue(mockDomains[0] as any);

      const result = await service.buildLlmsTxt();

      expect(result).toContain('https://api.example.com');
    });

    it('should format domains correctly in llms.txt', async () => {
      domainRepository.findAllDomains.mockResolvedValue(mockDomains as any);
      domainRepository.getMainDomain.mockResolvedValue(mockDomains[0] as any);

      const result = await service.buildLlmsTxt();

      expect(result).toContain('example.com, test.com');
    });

    it('should include base URL in llms.txt', async () => {
      domainRepository.findAllDomains.mockResolvedValue(mockDomains as any);
      domainRepository.getMainDomain.mockResolvedValue(mockDomains[0] as any);

      const result = await service.buildLlmsTxt();

      expect(result).toContain('https://api.example.com');
    });
  });
});
