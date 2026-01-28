import { Test, TestingModule } from '@nestjs/testing';
import * as os from 'os';
import { BindingService } from '../dns/binding.service';
import { mockNetworkInterfaces } from './mocks/network.mock';
import { generateMockDomain } from './mocks/domains.mock';

jest.mock('os');

describe('BindingService', () => {
  let service: BindingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BindingService],
    }).compile();

    service = module.get<BindingService>(BindingService);
  });

  describe('getServerIPv4', () => {
    it('should return the first external IPv4 address', () => {
      jest
        .spyOn(os, 'networkInterfaces')
        .mockReturnValue(mockNetworkInterfaces());

      const result = service.getServerIPv4();

      expect(result).toBe('192.168.1.1');
    });

    it('should throw an error if no IPv4 address is found', () => {
      jest.spyOn(os, 'networkInterfaces').mockReturnValue({
        eth0: [
          {
            family: 'IPv6',
            address: 'fe80::1',
            internal: false,
            netmask: 'ffff:ffff:ffff:ffff::',
            mac: '00:1B:44:11:3A:B7',
            scopeid: 1,
            cidr: 'fe80::1/64',
          },
        ],
      });

      expect(() => service.getServerIPv4()).toThrow('No IPv4 address found');
    });
  });

  describe('createPrimaryBinding', () => {
    it('should create a primary DNS binding record for a given domain', () => {
      const mockDomain = generateMockDomain();
      jest.spyOn(service, 'getServerIPv4').mockReturnValue('192.168.1.1');

      const result = service.createPrimaryBinding(mockDomain);

      expect(result).toBe(`${mockDomain.domain}. IN A 192.168.1.1`);
    });
  });

  describe('createWildcardBinding', () => {
    it('should create a wildcard DNS binding record for a given domain', () => {
      const mockDomain = generateMockDomain();
      jest.spyOn(service, 'getServerIPv4').mockReturnValue('192.168.1.1');

      const result = service.createWildcardBinding(mockDomain);

      expect(result).toBe(`*.${mockDomain.domain}. IN A 192.168.1.1`);
    });
  });

  describe('getChallengeRecordName', () => {
    it('should return the correct challenge record name', () => {
      const mockDomain = generateMockDomain();

      const result = service.getChallengeRecordName(mockDomain);

      expect(result).toBe(`_haddock-challenge.${mockDomain.domain}`);
    });
  });

  describe('createChallengeBinding', () => {
    it('should create a DNS challenge binding record for a given domain', () => {
      const mockDomain = generateMockDomain();

      const result = service.createChallengeBinding(mockDomain);

      expect(result).toBe(
        `${service.getChallengeRecordName(mockDomain)} IN TXT "${mockDomain.challenge}"`,
      );
    });

    it('should include challenge value in binding', () => {
      const mockDomain = generateMockDomain();
      mockDomain.challenge = 'test-challenge-123';

      const result = service.createChallengeBinding(mockDomain);

      expect(result).toContain('test-challenge-123');
    });

    it('should format challenge binding correctly', () => {
      const mockDomain = generateMockDomain();
      mockDomain.domain = 'example.com';
      mockDomain.challenge = 'abc123';

      const result = service.createChallengeBinding(mockDomain);

      expect(result).toContain('IN TXT');
      expect(result).toContain('"abc123"');
    });
  });

  describe('getServerIPv4', () => {
    it('should skip internal interfaces', () => {
      jest.spyOn(os, 'networkInterfaces').mockReturnValue({
        lo0: [
          {
            family: 'IPv4',
            address: '127.0.0.1',
            internal: true,
            netmask: '255.0.0.0',
            mac: '00:00:00:00:00:00',
            cidr: '127.0.0.1/8',
          },
        ],
        eth0: [
          {
            family: 'IPv4',
            address: '192.168.1.1',
            internal: false,
            netmask: '255.255.255.0',
            mac: '00:1B:44:11:3A:B7',
            cidr: '192.168.1.1/24',
          },
        ],
      });

      const result = service.getServerIPv4();

      expect(result).toBe('192.168.1.1');
    });

    it('should handle multiple network interfaces', () => {
      jest.spyOn(os, 'networkInterfaces').mockReturnValue({
        eth0: [
          {
            family: 'IPv4',
            address: '10.0.0.1',
            internal: false,
            netmask: '255.0.0.0',
            mac: '00:1B:44:11:3A:B7',
            cidr: '10.0.0.1/8',
          },
        ],
        eth1: [
          {
            family: 'IPv4',
            address: '192.168.1.1',
            internal: false,
            netmask: '255.255.255.0',
            mac: '00:1B:44:11:3A:B8',
            cidr: '192.168.1.1/24',
          },
        ],
      });

      const result = service.getServerIPv4();

      expect(result).toBe('10.0.0.1');
    });
  });
});
