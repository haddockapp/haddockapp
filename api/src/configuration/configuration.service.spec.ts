import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationService } from './configuration.service';
import { ConfigurationRepository } from './configuration.repository';
import {
  GITHUB_ID_KEY,
  GITHUB_SECRET_KEY,
  SAML_ENTRY_POINT_KEY,
  SAML_ISSUER_KEY,
  SAML_CERT_KEY,
  SAML_CALLBACK_URL_KEY,
  SAML_ENABLED_KEY,
} from './utils/consts';

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let repository: jest.Mocked<ConfigurationRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationService,
        {
          provide: ConfigurationRepository,
          useValue: {
            getConfigurationByKeys: jest.fn(),
            updateConfiguration: jest.fn(),
            getConfiguration: jest.fn(),
            getConfigurationByKey: jest.fn(),
            createConfiguration: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigurationService>(ConfigurationService);
    repository = module.get(ConfigurationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkGithubTokensConformity', () => {
    it('should return true for valid tokens', async () => {
      const result = await service.checkGithubTokensConformity(
        'client-id',
        'client-secret',
      );

      expect(result).toBe(true);
    });
  });

  describe('getGithubConfiguration', () => {
    it('should return GitHub configuration when both keys exist', async () => {
      const configs = [
        { key: GITHUB_ID_KEY, value: 'test-client-id' },
        { key: GITHUB_SECRET_KEY, value: 'test-client-secret' },
      ];

      repository.getConfigurationByKeys.mockResolvedValue(configs as any);

      const result = await service.getGithubConfiguration();

      expect(result).toEqual({
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
      });
    });

    it('should return null when configuration is incomplete', async () => {
      repository.getConfigurationByKeys.mockResolvedValue([
        { key: GITHUB_ID_KEY, value: 'test-client-id' },
      ] as any);

      const result = await service.getGithubConfiguration();

      expect(result).toBeNull();
    });
  });

  describe('modifyConfiguration', () => {
    it('should create configuration if it does not exist', async () => {
      repository.getConfigurationByKey.mockResolvedValue(null);
      repository.createConfiguration.mockResolvedValue({} as any);

      await service.modifyConfiguration('new-key', 'new-value');

      expect(repository.createConfiguration).toHaveBeenCalledWith(
        'new-key',
        'new-value',
      );
    });

    it('should modify configuration successfully', async () => {
      repository.getConfigurationByKey.mockResolvedValue({
        key: 'test-key',
      } as any);
      repository.updateConfiguration.mockResolvedValue({} as any);

      await service.modifyConfiguration('test-key', 'test-value');

      expect(repository.updateConfiguration).toHaveBeenCalledWith(
        'test-key',
        'test-value',
      );
    });

    it('should handle string values', async () => {
      repository.getConfigurationByKey.mockResolvedValue(null);
      repository.createConfiguration.mockResolvedValue({} as any);

      await service.modifyConfiguration('string-key', 'string-value');

      expect(repository.createConfiguration).toHaveBeenCalledWith(
        'string-key',
        'string-value',
      );
    });

    it('should handle boolean values', async () => {
      repository.getConfigurationByKey.mockResolvedValue({
        key: 'bool-key',
      } as any);
      repository.updateConfiguration.mockResolvedValue({} as any);

      await service.modifyConfiguration('bool-key', true);

      expect(repository.updateConfiguration).toHaveBeenCalledWith(
        'bool-key',
        true,
      );
    });

    it('should handle number values', async () => {
      repository.getConfigurationByKey.mockResolvedValue({
        key: 'number-key',
      } as any);
      repository.updateConfiguration.mockResolvedValue({} as any);

      await service.modifyConfiguration('number-key', 123);

      expect(repository.updateConfiguration).toHaveBeenCalledWith(
        'number-key',
        123,
      );
    });
  });

  describe('getSamlConfiguration', () => {
    it('should return SAML configuration when all keys exist', async () => {
      const configs = [
        { key: SAML_ENTRY_POINT_KEY, value: 'https://saml.example.com' },
        { key: SAML_ISSUER_KEY, value: 'test-issuer' },
        { key: SAML_CERT_KEY, value: 'cert-content' },
        { key: SAML_CALLBACK_URL_KEY, value: 'https://callback.example.com' },
        { key: SAML_ENABLED_KEY, value: true },
      ];

      repository.getConfigurationByKeys.mockResolvedValue(configs as any);

      const result = await service.getSamlConfiguration();

      expect(result).toBeDefined();
      expect(result?.entryPoint).toBe('https://saml.example.com');
      expect(result?.issuer).toBe('test-issuer');
    });

    it('should return null when SAML configuration is incomplete', async () => {
      repository.getConfigurationByKeys.mockResolvedValue([
        { key: SAML_ENTRY_POINT_KEY, value: 'https://saml.example.com' },
      ] as any);

      const result = await service.getSamlConfiguration();

      expect(result).toBeNull();
    });

    it('should use default callback URL when not provided', async () => {
      const configs = [
        { key: SAML_ENTRY_POINT_KEY, value: 'https://saml.example.com' },
        { key: SAML_ISSUER_KEY, value: 'test-issuer' },
        { key: SAML_CERT_KEY, value: 'cert-content' },
      ];

      repository.getConfigurationByKeys.mockResolvedValue(configs as any);

      const result = await service.getSamlConfiguration();

      expect(result?.callbackUrl).toBeDefined();
    });

    it('should return enabled status from configuration', async () => {
      const configs = [
        { key: SAML_ENTRY_POINT_KEY, value: 'https://saml.example.com' },
        { key: SAML_ISSUER_KEY, value: 'test-issuer' },
        { key: SAML_CERT_KEY, value: 'cert-content' },
        { key: SAML_ENABLED_KEY, value: true },
      ];

      repository.getConfigurationByKeys.mockResolvedValue(configs as any);

      const result = await service.getSamlConfiguration();

      expect(result?.enabled).toBe(true);
    });
  });
});
