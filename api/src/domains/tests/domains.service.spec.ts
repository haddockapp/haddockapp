// domains.service.spec.ts
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CaddyService } from '../../caddy/caddy.service';
import { FrontendService } from '../../frontend/frontend.service';
import { BindingService } from '../dns/binding.service';
import { DnsService } from '../dns/dns.service';
import { DomainRepository } from '../domains.repository';
import { DomainsService } from '../domains.service';
import { ConfigurationService } from '../../configuration/configuration.service';
import { AutologinsService } from '../../autologins/autologins.service';
import {
  createDtoFromDomain,
  generateCreateDomainDto,
  generateMockDomain,
} from './mocks/domains.mock';

jest.mock('../domains.repository');
jest.mock('../dns/dns.service');
jest.mock('../dns/binding.service');
jest.mock('../../frontend/frontend.service');
jest.mock('../../caddy/caddy.service');

describe('DomainsService', () => {
  let service: DomainsService;
  let domainRepository: jest.Mocked<DomainRepository>;
  let dnsService: jest.Mocked<DnsService>;
  let bindingService: jest.Mocked<BindingService>;
  let frontendService: jest.Mocked<FrontendService>;
  let caddyService: jest.Mocked<CaddyService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainsService,
        DomainRepository,
        BindingService,
        DnsService,
        FrontendService,
        CaddyService,
        {
          provide: ConfigurationService,
          useValue: {
            getConfigurationByKey: jest.fn().mockResolvedValue(null),
            modifyConfiguration: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AutologinsService,
          useValue: {
            generateToken: jest.fn().mockResolvedValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<DomainsService>(DomainsService);
    domainRepository = module.get(DomainRepository);
    dnsService = module.get(DnsService);
    bindingService = module.get(BindingService);
    frontendService = module.get(FrontendService);
    caddyService = module.get(CaddyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a domain successfully', async () => {
      const mockDomain = generateMockDomain();
      const createDomainDto = createDtoFromDomain(mockDomain);

      domainRepository.hasMainDomain.mockResolvedValue(!createDomainDto.main);
      domainRepository.createDomain.mockResolvedValue(mockDomain);

      const result = await service.create(createDomainDto);

      expect(result.domain).toEqual(createDomainDto.domain);
      expect(domainRepository.createDomain).toHaveBeenCalledWith(
        createDomainDto,
        expect.any(String),
      );
    });

    it('should throw an exception if main domain already exists', async () => {
      const createDomainDto = generateCreateDomainDto();
      createDomainDto.main = true;

      domainRepository.hasMainDomain.mockResolvedValue(true);

      await expect(service.create(createDomainDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all domains', async () => {
      const mockDomains = [generateMockDomain(), generateMockDomain()];

      domainRepository.findAllDomains.mockResolvedValue(mockDomains);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(domainRepository.findAllDomains).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should find a domain by ID', async () => {
      const mockDomain = generateMockDomain();

      domainRepository.findDomainById.mockResolvedValue(mockDomain);

      const result = await service.findOne(mockDomain.id);

      expect(result.domain).toEqual(mockDomain.domain);
      expect(domainRepository.findDomainById).toHaveBeenCalledWith(
        mockDomain.id,
      );
    });
  });

  describe('getDomainStatus', () => {
    it('should return domain status', async () => {
      const mockDomain = generateMockDomain();

      domainRepository.findDomainById.mockResolvedValue(mockDomain);
      dnsService.getPrimaryStatus.mockResolvedValue(true);
      dnsService.getWildcardStatus.mockResolvedValue(true);
      dnsService.getChallengeStatus.mockResolvedValue(true);
      domainRepository.linkDomain.mockResolvedValue(mockDomain);

      const result = await service.getDomainStatus(mockDomain.id);

      expect(result.canBeLinked).toBe(true);
      expect(domainRepository.findDomainById).toHaveBeenCalledWith(
        mockDomain.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a domain successfully', async () => {
      const mockDomain = generateMockDomain();
      mockDomain.main = false;
      mockDomain.linked = false;

      domainRepository.deleteDomain.mockResolvedValue(mockDomain);

      const result = await service.remove(mockDomain.id);

      expect(result).toEqual(mockDomain);
      expect(domainRepository.deleteDomain).toHaveBeenCalledWith(mockDomain.id);
    });

    it('should throw an exception if trying to delete a linked main domain', async () => {
      const mockDomain = generateMockDomain();
      mockDomain.main = true;
      mockDomain.linked = true;

      domainRepository.deleteDomain.mockResolvedValue(mockDomain);

      await expect(service.remove(mockDomain.id)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('apply', () => {
    it('should apply domain configuration successfully', async () => {
      const mockDomain = generateMockDomain();
      mockDomain.main = true;
      mockDomain.linked = true;

      domainRepository.getMainDomain.mockResolvedValue(mockDomain);
      service.getDomainStatus = jest
        .fn()
        .mockResolvedValue({ canBeLinked: true });
      caddyService.generate.mockResolvedValue();
      frontendService.setFrontendConfigValue.mockResolvedValue();

      const result = await service.apply(
        '16e1feaa-e7ff-49aa-870e-8fb333f21843',
      );

      expect(result.mainDomain).toEqual(mockDomain.domain);
      expect(caddyService.generate).toHaveBeenCalled();
      expect(frontendService.setFrontendConfigValue).toHaveBeenCalledWith(
        'backendUrl',
        `https://api.${mockDomain.domain}`,
      );
    });

    it('should throw an exception if no main domain exists', async () => {
      domainRepository.getMainDomain.mockResolvedValue(null);

      await expect(
        service.apply('b2620e07-ba9c-4402-82a6-a0fb4a885a12'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw an exception if domain status does not allow linking', async () => {
      const mockDomain = generateMockDomain();
      mockDomain.main = true;

      domainRepository.getMainDomain.mockResolvedValue(mockDomain);
      service.getDomainStatus = jest
        .fn()
        .mockResolvedValue({ canBeLinked: false });

      await expect(
        service.apply('6fd8b4e9-6f8a-4f32-803c-cfae418e10ff'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle HTTP domain configuration', async () => {
      const mockDomain = generateMockDomain();
      mockDomain.main = true;
      mockDomain.https = false;

      domainRepository.getMainDomain.mockResolvedValue(mockDomain);
      service.getDomainStatus = jest
        .fn()
        .mockResolvedValue({ canBeLinked: true });
      caddyService.generate.mockResolvedValue();
      frontendService.setFrontendConfigValue.mockResolvedValue();

      const result = await service.apply(
        '16e1feaa-e7ff-49aa-870e-8fb333f21843',
      );

      expect(result.frontendUrl).toContain('http://');
      expect(caddyService.generate).toHaveBeenCalled();
    });
  });

  describe('getDomainStatus', () => {
    it('should return false canBeLinked if primary status is false', async () => {
      const mockDomain = generateMockDomain();

      domainRepository.findDomainById.mockResolvedValue(mockDomain);
      dnsService.getPrimaryStatus.mockResolvedValue(false);
      dnsService.getWildcardStatus.mockResolvedValue(true);
      dnsService.getChallengeStatus.mockResolvedValue(true);
      domainRepository.linkDomain.mockResolvedValue(mockDomain);

      const result = await service.getDomainStatus(mockDomain.id);

      expect(result.canBeLinked).toBe(false);
    });

    it('should return false canBeLinked if challenge status is false', async () => {
      const mockDomain = generateMockDomain();

      domainRepository.findDomainById.mockResolvedValue(mockDomain);
      dnsService.getPrimaryStatus.mockResolvedValue(true);
      dnsService.getWildcardStatus.mockResolvedValue(true);
      dnsService.getChallengeStatus.mockResolvedValue(false);
      domainRepository.linkDomain.mockResolvedValue(mockDomain);

      const result = await service.getDomainStatus(mockDomain.id);

      expect(result.canBeLinked).toBe(false);
    });

    it('should require wildcard status for main domain', async () => {
      const mockDomain = generateMockDomain();
      mockDomain.main = true;

      domainRepository.findDomainById.mockResolvedValue(mockDomain);
      dnsService.getPrimaryStatus.mockResolvedValue(true);
      dnsService.getWildcardStatus.mockResolvedValue(false);
      dnsService.getChallengeStatus.mockResolvedValue(true);
      domainRepository.linkDomain.mockResolvedValue(mockDomain);

      const result = await service.getDomainStatus(mockDomain.id);

      expect(result.canBeLinked).toBe(false);
    });
  });

  describe('findDomainByName', () => {
    it('should find domain by name', async () => {
      const mockDomain = generateMockDomain();

      domainRepository.findDomainByName = jest
        .fn()
        .mockResolvedValue(mockDomain);

      const result = await service.findDomainByName('example.com');

      expect(result).toEqual(mockDomain);
    });

    it('should return null if domain not found', async () => {
      domainRepository.findDomainByName = jest.fn().mockResolvedValue(null);

      const result = await service.findDomainByName('nonexistent.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should throw exception if trying to create non-main domain without main domain', async () => {
      const createDomainDto = generateCreateDomainDto();
      createDomainDto.main = false;

      domainRepository.hasMainDomain.mockResolvedValue(false);

      await expect(service.create(createDomainDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should generate challenge for new domain', async () => {
      const mockDomain = generateMockDomain();
      const createDomainDto = createDtoFromDomain(mockDomain);

      domainRepository.hasMainDomain.mockResolvedValue(!createDomainDto.main);
      domainRepository.createDomain.mockResolvedValue(mockDomain);

      await service.create(createDomainDto);

      expect(domainRepository.createDomain).toHaveBeenCalledWith(
        createDomainDto,
        expect.stringMatching(/^[a-zA-Z0-9]{32}$/),
      );
    });
  });
});
