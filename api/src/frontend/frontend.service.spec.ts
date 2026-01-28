import { Test, TestingModule } from '@nestjs/testing';
import { FrontendService } from './frontend.service';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('FrontendService', () => {
  let service: FrontendService;
  let readFile: jest.Mock;
  let writeFile: jest.Mock;

  beforeEach(async () => {
    const fsModule = require('fs');
    readFile = fsModule.promises.readFile = jest.fn();
    writeFile = fsModule.promises.writeFile = jest.fn();

    process.env.FRONTEND_CONFIG = '/path/to/config.json';

    const module: TestingModule = await Test.createTestingModule({
      providers: [FrontendService],
    }).compile();

    service = module.get<FrontendService>(FrontendService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFrontendConfig', () => {
    it('should read and parse frontend config', async () => {
      const mockConfig = {
        backendUrl: 'http://localhost:3000',
        socketUrl: 'ws://localhost:3000',
      };
      readFile.mockResolvedValue(Buffer.from(JSON.stringify(mockConfig)));

      const result = await service.getFrontendConfig();

      expect(result).toEqual(mockConfig);
      expect(readFile).toHaveBeenCalledWith('/path/to/config.json');
    });
  });

  describe('setFrontendConfig', () => {
    it('should write frontend config to file', async () => {
      const mockConfig = {
        backendUrl: 'http://localhost:3000',
        socketUrl: 'ws://localhost:3000',
      };
      writeFile.mockResolvedValue(undefined);

      await service.setFrontendConfig(mockConfig);

      expect(writeFile).toHaveBeenCalledWith(
        '/path/to/config.json',
        JSON.stringify(mockConfig),
      );
    });
  });

  describe('setFrontendConfigValue', () => {
    it('should update single config value', async () => {
      const existingConfig = {
        backendUrl: 'http://localhost:3000',
        socketUrl: 'ws://localhost:3000',
      };
      readFile.mockResolvedValue(Buffer.from(JSON.stringify(existingConfig)));
      writeFile.mockResolvedValue(undefined);

      await service.setFrontendConfigValue('socketUrl', 'ws://localhost:3001');

      expect(writeFile).toHaveBeenCalledWith(
        '/path/to/config.json',
        JSON.stringify({
          ...existingConfig,
          socketUrl: 'ws://localhost:3001',
        }),
      );
    });
  });

  describe('getFrontendConfigValue', () => {
    it('should get single config value', async () => {
      const mockConfig = {
        backendUrl: 'http://localhost:3000',
        socketUrl: 'ws://localhost:3001',
      };
      readFile.mockResolvedValue(Buffer.from(JSON.stringify(mockConfig)));

      const result = await service.getFrontendConfigValue('backendUrl');

      expect(result).toBe('http://localhost:3000');
    });
  });
});
