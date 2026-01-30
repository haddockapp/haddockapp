import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { GithubService } from './github.service';
import { AuthorizationService } from '../authorization/authorization.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { AuthError } from '../auth/error/AuthError';
import { AuthorizationRepository } from '../authorization/authorization.repository';
import { AuthorizationMapper } from '../authorization/authorization.mapper';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

jest.mock('axios');
jest.mock('../authorization/authorization.repository');
jest.mock('../authorization/authorization.mapper');

describe('GithubService', () => {
  let service: GithubService;
  let authorizationService: jest.Mocked<AuthorizationService>;
  let configurationService: jest.Mocked<ConfigurationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: AuthorizationService,
          useValue: {
            getHeadersForAuthorization: jest.fn(),
          },
        },
        {
          provide: ConfigurationService,
          useValue: {
            getGithubConfiguration: jest.fn(),
          },
        },
        {
          provide: AuthorizationRepository,
          useValue: {},
        },
        {
          provide: AuthorizationMapper,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
    authorizationService = module.get(AuthorizationService);
    configurationService = module.get(ConfigurationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exchangeCode', () => {
    it('should exchange code for access token', async () => {
      const mockConfig = {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
      };

      configurationService.getGithubConfiguration.mockResolvedValue(mockConfig);
      (axios.post as jest.Mock).mockResolvedValue({
        data: { access_token: 'test-token' },
      });

      const result = await service.exchangeCode('test-code');

      expect(result).toBe('test-token');
      expect(axios.post).toHaveBeenCalled();
    });

    it('should throw error if GitHub config is not set', async () => {
      configurationService.getGithubConfiguration.mockResolvedValue(null);

      await expect(service.exchangeCode('test-code')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw AuthError if GitHub returns error', async () => {
      const mockConfig = {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
      };

      configurationService.getGithubConfiguration.mockResolvedValue(mockConfig);
      (axios.post as jest.Mock).mockResolvedValue({
        data: { error: 'invalid_code' },
      });

      await expect(service.exchangeCode('invalid-code')).rejects.toThrow(
        AuthError,
      );
    });
  });

  describe('getUserEmails', () => {
    it('should return user emails', async () => {
      const mockEmails = [
        { email: 'test@example.com', primary: true },
        { email: 'test2@example.com', primary: false },
      ];

      (axios.get as jest.Mock).mockResolvedValue({ data: mockEmails });

      const result = await service.getUserEmails('test-token');

      expect(result).toEqual(mockEmails);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/user/emails',
        expect.objectContaining({
          headers: { Authorization: 'token test-token' },
        }),
      );
    });
  });

  describe('getUserPrimaryEmail', () => {
    it('should return primary email', async () => {
      const mockEmails = [
        { email: 'primary@example.com', primary: true },
        { email: 'secondary@example.com', primary: false },
      ];

      (axios.get as jest.Mock).mockResolvedValue({ data: mockEmails });

      const result = await service.getUserPrimaryEmail('test-token');

      expect(result).toBe('primary@example.com');
    });
  });

  describe('getUserRepositoriesList', () => {
    it('should return user repositories', async () => {
      const mockRepos = [
        { id: 1, name: 'repo1' },
        { id: 2, name: 'repo2' },
      ];

      authorizationService.getHeadersForAuthorization.mockResolvedValue({
        Authorization: 'Bearer token',
      });
      (axios.get as jest.Mock).mockResolvedValue({ data: mockRepos });

      const result = await service.getUserRepositoriesList('auth-id');

      expect(result).toEqual(mockRepos);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/user/repos?per_page=100',
        expect.objectContaining({
          headers: { Authorization: 'Bearer token' },
        }),
      );
    });
  });
});
