import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import { AutologinsService } from './autologins.service';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';

describe('AutologinsService', () => {
  let service: AutologinsService;
  let cacheManager: jest.Mocked<any>;
  let authService: jest.Mocked<AuthService>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AutologinsService>(AutologinsService);
    cacheManager = module.get(CACHE_MANAGER);
    authService = module.get(AuthService);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate and store autologin token', async () => {
      cacheManager.set.mockResolvedValue(undefined);

      const token = await service.generateToken('user-1');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('autologin:'),
        'user-1',
        24 * 60 * 60 * 1000,
      );
    });
  });

  describe('authWithToken', () => {
    it('should authenticate user with valid token', async () => {
      const token = 'valid-token';
      cacheManager.get.mockResolvedValue('user-1');
      cacheManager.del.mockResolvedValue(undefined);
      userRepository.findById.mockResolvedValue(mockUser as any);
      authService.generateJwt.mockReturnValue('jwt-token');

      const result = await service.authWithToken(token);

      expect(result).toEqual({ accessToken: 'jwt-token' });
      expect(cacheManager.get).toHaveBeenCalledWith(`autologin:${token}`);
      expect(cacheManager.del).toHaveBeenCalledWith(`autologin:${token}`);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(authService.generateJwt).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      cacheManager.get.mockResolvedValue(null);

      await expect(service.authWithToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(cacheManager.del).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for expired token', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      await expect(service.authWithToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
