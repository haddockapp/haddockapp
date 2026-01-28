import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import { AutologinsController } from './autologins.controller';
import { AutologinsService } from './autologins.service';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';

describe('AutologinsController', () => {
  let controller: AutologinsController;
  let service: jest.Mocked<AutologinsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutologinsController],
      providers: [
        AutologinsService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            generateJwt: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AutologinsController>(AutologinsController);
    service = module.get(AutologinsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('auth', () => {
    it('should authenticate with token', async () => {
      const mockResult = { accessToken: 'jwt-token' };
      service.authWithToken = jest.fn().mockResolvedValue(mockResult);

      const result = await controller.auth({ token: 'test-token' });

      expect(result).toEqual(mockResult);
      expect(service.authWithToken).toHaveBeenCalledWith('test-token');
    });

    it('should handle invalid token', async () => {
      service.authWithToken = jest
        .fn()
        .mockRejectedValue(new UnauthorizedException('Invalid token'));

      await expect(controller.auth({ token: 'invalid' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
