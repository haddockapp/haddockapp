import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthorizationEntityService } from './authorization-entity.service';
import { AuthorizationRepository } from './authorization.repository';
import { AuthorizationMapper } from './authorization.mapper';
import { GithubService } from '../github/github.service';
import { AuthorizationService } from './authorization.service';
import { CreateAuthorizationDTO } from './dto/request/create-authorization.dto';
import { AuthorizationEnum } from './types/authorization.enum';
import { AuthError } from '../auth/error/AuthError';

describe('AuthorizationEntityService', () => {
  let service: AuthorizationEntityService;
  let repository: jest.Mocked<AuthorizationRepository>;
  let mapper: jest.Mocked<AuthorizationMapper>;
  let githubService: jest.Mocked<GithubService>;
  let authorizationService: jest.Mocked<AuthorizationService>;

  const mockAuthorization = {
    id: 'auth-1',
    name: 'Test Auth',
    type: AuthorizationEnum.OAUTH,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationEntityService,
        {
          provide: AuthorizationRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AuthorizationMapper,
          useValue: {
            toResponse: jest.fn(),
          },
        },
        {
          provide: GithubService,
          useValue: {
            exchangeCode: jest.fn(),
          },
        },
        {
          provide: AuthorizationService,
          useValue: {
            createAuthorization: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthorizationEntityService>(
      AuthorizationEntityService,
    );
    repository = module.get(AuthorizationRepository);
    mapper = module.get(AuthorizationMapper);
    githubService = module.get(GithubService);
    authorizationService = module.get(AuthorizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all authorizations', async () => {
      const authorizations = [mockAuthorization];
      repository.findAll.mockResolvedValue(authorizations as any);
      mapper.toResponse.mockReturnValue(mockAuthorization as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return authorization by id', async () => {
      repository.findById.mockResolvedValue(mockAuthorization as any);
      mapper.toResponse.mockReturnValue(mockAuthorization as any);

      const result = await service.findById('auth-1');

      expect(result).toEqual(mockAuthorization);
      expect(repository.findById).toHaveBeenCalledWith('auth-1');
    });
  });

  describe('delete', () => {
    it('should delete authorization', async () => {
      repository.delete.mockResolvedValue();

      await service.delete('auth-1');

      expect(repository.delete).toHaveBeenCalledWith('auth-1');
    });
  });

  describe('create', () => {
    it('should create OAuth authorization', async () => {
      const createDto: CreateAuthorizationDTO = {
        name: 'OAuth Auth',
        type: AuthorizationEnum.OAUTH,
        data: {
          code: 'oauth-code',
        },
      };

      githubService.exchangeCode.mockResolvedValue('oauth-token');
      authorizationService.createAuthorization.mockResolvedValue(
        mockAuthorization as any,
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockAuthorization);
      expect(githubService.exchangeCode).toHaveBeenCalledWith('oauth-code');
    });

    it('should create PAT authorization', async () => {
      const createDto: CreateAuthorizationDTO = {
        name: 'PAT Auth',
        type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN,
        data: {
          token: 'pat-token',
        },
      };

      authorizationService.createAuthorization.mockResolvedValue(
        mockAuthorization as any,
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockAuthorization);
      expect(githubService.exchangeCode).not.toHaveBeenCalled();
    });

    it('should create deploy key authorization', async () => {
      const createDto: CreateAuthorizationDTO = {
        name: 'Deploy Key',
        type: AuthorizationEnum.DEPLOY_KEY,
        data: {
          key: 'deploy-key-content',
        },
      };

      authorizationService.createAuthorization.mockResolvedValue(
        mockAuthorization as any,
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockAuthorization);
    });

    it('should throw BadRequestException for invalid OAuth code', async () => {
      const createDto: CreateAuthorizationDTO = {
        name: 'OAuth Auth',
        type: AuthorizationEnum.OAUTH,
        data: {
          code: 'invalid-code',
        },
      };

      githubService.exchangeCode.mockRejectedValue(
        new AuthError('Invalid code'),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException for OAuth exchange errors', async () => {
      const createDto: CreateAuthorizationDTO = {
        name: 'OAuth Auth',
        type: AuthorizationEnum.OAUTH,
        data: {
          code: 'oauth-code',
        },
      };

      githubService.exchangeCode.mockRejectedValue(new Error('Server error'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
