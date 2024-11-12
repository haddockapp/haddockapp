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
      jest.spyOn(os, 'networkInterfaces').mockReturnValue(mockNetworkInterfaces());

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

      expect(result).toBe(`${service.getChallengeRecordName(mockDomain)} IN TXT "${mockDomain.challenge}"`);
    });
  });
});
