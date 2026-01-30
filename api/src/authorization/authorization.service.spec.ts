import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotImplementedException } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationMapper } from './authorization.mapper';
import { AuthorizationEnum } from './types/authorization.enum';
import { AuthorizationDTO } from './dto/authorization.dto';
import axios from 'axios';

jest.mock('axios');

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let repository: jest.Mocked<AuthorizationRepository>;
  let mapper: jest.Mocked<AuthorizationMapper>;

  const mockAuthorization = {
    id: 'auth-1',
    type: AuthorizationEnum.OAUTH,
    data: {
      token: 'oauth_token',
    },
  };

  const mockDeployKeyAuth = {
    id: 'auth-2',
    type: AuthorizationEnum.DEPLOY_KEY,
    data: {
      key: 'deploy_key',
    },
  };

  const mockPatAuth = {
    id: 'auth-3',
    type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN,
    data: {
      token: 'pat_token',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        {
          provide: AuthorizationRepository,
          useValue: {
            findById: jest.fn(),
            createAuthorization: jest.fn(),
          },
        },
        {
          provide: AuthorizationMapper,
          useValue: {
            toAuthorizationObject: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
    repository = module.get(AuthorizationRepository);
    mapper = module.get(AuthorizationMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthorizationType', () => {
    it('should return authorization type', async () => {
      repository.findById.mockResolvedValue(mockAuthorization as any);
      mapper.toAuthorizationObject.mockReturnValue(mockAuthorization as any);

      const result = await service.getAuthorizationType('auth-1');

      expect(result).toBe(AuthorizationEnum.OAUTH);
      expect(repository.findById).toHaveBeenCalledWith('auth-1');
    });
  });

  describe('getAuthorizationKey', () => {
    it('should return deploy key for DEPLOY_KEY type', async () => {
      repository.findById.mockResolvedValue(mockDeployKeyAuth as any);
      mapper.toAuthorizationObject.mockReturnValue(mockDeployKeyAuth as any);

      const result = await service.getAuthorizationKey('auth-2');

      expect(result).toBe('deploy_key');
    });
  });

  describe('getHeadersForAuthorization', () => {
    it('should return Bearer token for OAUTH', async () => {
      repository.findById.mockResolvedValue(mockAuthorization as any);
      mapper.toAuthorizationObject.mockReturnValue(mockAuthorization as any);

      const result = await service.getHeadersForAuthorization('auth-1');

      expect(result).toEqual({
        Authorization: 'Bearer oauth_token',
      });
    });

    it('should return token header for PAT', async () => {
      repository.findById.mockResolvedValue(mockPatAuth as any);
      mapper.toAuthorizationObject.mockReturnValue(mockPatAuth as any);

      const result = await service.getHeadersForAuthorization('auth-3');

      expect(result).toEqual({
        Authorization: 'token pat_token',
      });
    });

    it('should throw BadRequestException for DEPLOY_KEY', async () => {
      repository.findById.mockResolvedValue(mockDeployKeyAuth as any);
      mapper.toAuthorizationObject.mockReturnValue(mockDeployKeyAuth as any);

      await expect(
        service.getHeadersForAuthorization('auth-2'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDeployHeaderForAuthorization', () => {
    it('should return username/password for OAUTH', async () => {
      repository.findById.mockResolvedValue(mockAuthorization as any);
      mapper.toAuthorizationObject.mockReturnValue(mockAuthorization as any);

      const result = await service.getDeployHeaderForAuthorization('auth-1');

      expect(result).toEqual({
        username: 'x-access-token',
        password: 'oauth_token',
      });
    });

    it('should return username/password for PAT', async () => {
      repository.findById.mockResolvedValue(mockPatAuth as any);
      mapper.toAuthorizationObject.mockReturnValue(mockPatAuth as any);

      const result = await service.getDeployHeaderForAuthorization('auth-3');

      expect(result).toEqual({
        username: 'x-access-token',
        password: 'pat_token',
      });
    });
  });

  describe('createAuthorization', () => {
    it('should create authorization successfully', async () => {
      const authDto: AuthorizationDTO = {
        name: 'Test Authorization',
        type: AuthorizationEnum.OAUTH,
        data: {
          token: 'new_token',
        },
      };

      repository.createAuthorization.mockResolvedValue(
        mockAuthorization as any,
      );

      const result = await service.createAuthorization(authDto);

      expect(result).toEqual(mockAuthorization);
      expect(repository.createAuthorization).toHaveBeenCalledWith(authDto);
    });

    it('should create PAT authorization', async () => {
      const authDto: AuthorizationDTO = {
        name: 'PAT Auth',
        type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN,
        data: {
          token: 'pat_token',
        },
      };

      repository.createAuthorization.mockResolvedValue(mockPatAuth as any);

      const result = await service.createAuthorization(authDto);

      expect(result).toEqual(mockPatAuth);
    });

    it('should create deploy key authorization', async () => {
      const authDto: AuthorizationDTO = {
        name: 'Deploy Key',
        type: AuthorizationEnum.DEPLOY_KEY,
        data: {
          key: 'deploy_key_content',
        },
      };

      repository.createAuthorization.mockResolvedValue(
        mockDeployKeyAuth as any,
      );

      const result = await service.createAuthorization(authDto);

      expect(result).toEqual(mockDeployKeyAuth);
    });
  });

  describe('canReadSource', () => {
    it('should return true for public repo without authorization', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

      const result = await service.canReadSource(null, 'owner', 'repo');

      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo',
      );
    });

    it('should return false for private repo without authorization', async () => {
      (axios.get as jest.Mock).mockRejectedValue({ status: 404 });

      const result = await service.canReadSource(null, 'owner', 'repo');

      expect(result).toBe(false);
    });

    it('should check access with OAUTH authorization', async () => {
      repository.findById.mockResolvedValue(mockAuthorization as any);
      mapper.toAuthorizationObject.mockReturnValue(mockAuthorization as any);
      (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

      const result = await service.canReadSource('auth-1', 'owner', 'repo');

      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer oauth_token',
          },
        }),
      );
    });

    it('should check access with PAT authorization', async () => {
      repository.findById.mockResolvedValue(mockPatAuth as any);
      mapper.toAuthorizationObject.mockReturnValue(mockPatAuth as any);
      (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

      const result = await service.canReadSource('auth-3', 'owner', 'repo');

      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo',
        expect.objectContaining({
          headers: {
            Authorization: 'token pat_token',
          },
        }),
      );
    });

    it('should return true for DEPLOY_KEY without checking', async () => {
      repository.findById.mockResolvedValue(mockDeployKeyAuth as any);
      mapper.toAuthorizationObject.mockReturnValue(mockDeployKeyAuth as any);

      const result = await service.canReadSource('auth-2', 'owner', 'repo');

      expect(result).toBe(true);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return false if authorization check fails', async () => {
      repository.findById.mockResolvedValue(mockAuthorization as any);
      mapper.toAuthorizationObject.mockReturnValue(mockAuthorization as any);
      (axios.get as jest.Mock).mockRejectedValue({ status: 403 });

      const result = await service.canReadSource('auth-1', 'owner', 'repo');

      expect(result).toBe(false);
    });
  });
});
