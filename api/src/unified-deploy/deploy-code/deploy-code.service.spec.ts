import { Test, TestingModule } from '@nestjs/testing';
import { DeployCodeService } from './deploy-code.service';

describe('DeployCodeService', () => {
  let service: DeployCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployCodeService],
    }).compile();

    service = module.get<DeployCodeService>(DeployCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOrGetCode', () => {
    it('should return existing code if available', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue('123456'),
      };
      (service as any).redis = mockRedis;

      const result = await service.generateOrGetCode();

      expect(result).toBe('123456');
      expect(mockRedis.get).toHaveBeenCalled();
    });

    it('should generate new code if none exists', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(null),
        pipeline: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([['OK']]),
        }),
      };
      (service as any).redis = mockRedis;

      const result = await service.generateOrGetCode();

      expect(result).toMatch(/^\d{6}$/);
      expect(mockRedis.pipeline).toHaveBeenCalled();
    });
  });

  describe('validate', () => {
    it('should not throw for valid code', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue('123456'),
      };
      (service as any).redis = mockRedis;

      await expect(service.validate('123456')).resolves.not.toThrow();
    });

    it('should throw for invalid code', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue('123456'),
      };
      (service as any).redis = mockRedis;

      await expect(service.validate('wrong-code')).rejects.toThrow();
    });

    it('should throw for expired code', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(null),
      };
      (service as any).redis = mockRedis;

      await expect(service.validate('expired-code')).rejects.toThrow();
    });

    it('should throw for empty code', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue('123456'),
      };
      (service as any).redis = mockRedis;

      await expect(service.validate('')).rejects.toThrow();
    });

    it('should validate code case-sensitively', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue('123456'),
      };
      (service as any).redis = mockRedis;

      await expect(service.validate('123456')).resolves.not.toThrow();
      await expect(service.validate('12345a')).rejects.toThrow();
    });
  });
});
