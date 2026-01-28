import { Test, TestingModule } from '@nestjs/testing';
import { DnsService } from './dns.service';
import { BindingService } from './binding.service';
import { promises as dns } from 'dns';

jest.mock('dns', () => ({
  promises: {
    resolve4: jest.fn(),
    resolveTxt: jest.fn(),
    resolveNs: jest.fn(),
    setServers: jest.fn(),
  },
}));

describe('DnsService', () => {
  let service: DnsService;

  const mockDomain = {
    id: 'domain-1',
    domain: 'example.com',
    main: true,
    https: true,
    challenge: 'test-challenge',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DnsService,
        {
          provide: BindingService,
          useValue: {
            getServerIPv4: jest.fn().mockReturnValue('192.168.1.1'),
            getChallengeRecordName: jest
              .fn()
              .mockReturnValue('_haddock-challenge.example.com'),
          },
        },
      ],
    }).compile();

    service = module.get<DnsService>(DnsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPrimaryStatus', () => {
    it('should return true when DNS record exists', async () => {
      (dns.resolveNs as jest.Mock).mockResolvedValue(['ns1.example.com']);
      (dns.resolve4 as jest.Mock)
        .mockResolvedValueOnce(['192.168.1.1'])
        .mockResolvedValueOnce(['192.168.1.1']);

      const result = await service.getPrimaryStatus(mockDomain as any);

      expect(result).toBe(true);
    });

    it('should return false when DNS record does not exist', async () => {
      (dns.resolveNs as jest.Mock).mockResolvedValue([]);

      const result = await service.getPrimaryStatus(mockDomain as any);

      expect(result).toBe(false);
    });
  });

  describe('getWildcardStatus', () => {
    it('should return true when wildcard DNS record exists', async () => {
      (dns.resolveNs as jest.Mock).mockResolvedValue(['ns1.example.com']);
      (dns.resolve4 as jest.Mock)
        .mockResolvedValueOnce(['192.168.1.1'])
        .mockResolvedValueOnce(['192.168.1.1']);

      const result = await service.getWildcardStatus(mockDomain as any);

      expect(result).toBe(true);
    });

    it('should return false when wildcard DNS record does not exist', async () => {
      (dns.resolveNs as jest.Mock).mockResolvedValue([]);

      const result = await service.getWildcardStatus(mockDomain as any);

      expect(result).toBe(false);
    });
  });

  describe('getChallengeStatus', () => {
    it('should return true when challenge TXT record exists', async () => {
      (dns.resolveNs as jest.Mock).mockResolvedValue(['ns1.example.com']);
      (dns.resolve4 as jest.Mock).mockResolvedValue(['192.168.1.1']);
      (dns.resolveTxt as jest.Mock).mockResolvedValue([['test-challenge']]);

      const result = await service.getChallengeStatus(mockDomain as any);

      expect(result).toBe(true);
    });

    it('should return false when challenge TXT record does not exist', async () => {
      (dns.resolveNs as jest.Mock).mockResolvedValue([]);

      const result = await service.getChallengeStatus(mockDomain as any);

      expect(result).toBe(false);
    });

    it('should return false when challenge TXT record does not match', async () => {
      (dns.resolveNs as jest.Mock).mockResolvedValue(['ns1.example.com']);
      (dns.resolve4 as jest.Mock).mockResolvedValue(['192.168.1.1']);
      (dns.resolveTxt as jest.Mock).mockResolvedValue([['wrong-challenge']]);

      const result = await service.getChallengeStatus(mockDomain as any);

      expect(result).toBe(false);
    });

    it('should handle multiple TXT records', async () => {
      (dns.resolveNs as jest.Mock).mockResolvedValue(['ns1.example.com']);
      (dns.resolve4 as jest.Mock).mockResolvedValue(['192.168.1.1']);
      (dns.resolveTxt as jest.Mock).mockResolvedValue([
        ['other-record'],
        ['test-challenge'],
      ]);

      const result = await service.getChallengeStatus(mockDomain as any);

      expect(result).toBe(true);
    });

    it('should handle DNS resolution errors gracefully', async () => {
      (dns.resolveNs as jest.Mock).mockRejectedValue(new Error('DNS error'));

      const result = await service.getPrimaryStatus(mockDomain as any);

      expect(result).toBe(false);
    });
  });
});
