import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import * as fs from 'fs';
import * as semver from 'semver';

jest.mock('fs');
jest.mock('semver');

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVersionInfo', () => {
    it('should return version info from package.json', async () => {
      const mockPackageJson = {
        version: '1.0.0',
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson),
      );
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          tag_name: 'v1.1.0',
          body: 'Changelog',
          html_url: 'https://github.com/releases/v1.1.0',
        }),
      });

      const result = await service.getVersionInfo();

      expect(result.currentVersion).toBe('1.0.0');
      expect(result.latestVersion).toBe('v1.1.0');
      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should handle GitHub API failure gracefully', async () => {
      const mockPackageJson = {
        version: '1.0.0',
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson),
      );
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.getVersionInfo();

      expect(result.currentVersion).toBe('1.0.0');
      expect(result.latestVersion).toBeNull();
    });

    it('should handle invalid package.json', async () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = await service.getVersionInfo();

      expect(result.currentVersion).toBe('unknown');
      expect(result.latestVersion).toBeNull();
    });

    it('should detect update availability', async () => {
      const mockPackageJson = {
        version: '1.0.0',
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson),
      );
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          tag_name: 'v1.1.0',
          body: 'Changelog',
          html_url: 'https://github.com/releases/v1.1.0',
        }),
      });
      (semver.valid as jest.Mock).mockReturnValue('1.1.0');
      (semver.gt as jest.Mock).mockReturnValue(true);

      const result = await service.getVersionInfo();

      expect(result.updateAvailable).toBe(true);
    });

    it('should handle version comparison with v prefix', async () => {
      const mockPackageJson = {
        version: 'v1.0.0',
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson),
      );
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          tag_name: 'v1.1.0',
          body: 'Changelog',
          html_url: 'https://github.com/releases/v1.1.0',
        }),
      });
      (semver.valid as jest.Mock).mockReturnValue('1.1.0');
      (semver.gt as jest.Mock).mockReturnValue(true);

      const result = await service.getVersionInfo();

      expect(result.updateAvailable).toBe(true);
    });
  });
});
