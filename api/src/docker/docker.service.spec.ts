import { Test, TestingModule } from '@nestjs/testing';
import { DockerService } from './docker.service';
import axios from 'axios';

jest.mock('axios');

describe('DockerService', () => {
  let service: DockerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DockerService],
    }).compile();

    service = module.get<DockerService>(DockerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getImageLogo', () => {
    it('should return image logo URL', async () => {
      const imageName = 'library%2Fnginx';
      const mockResponse = {
        data: {
          url: 'https://example.com/logo.png',
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.getImageLogo(imageName);

      expect(result).toBe('https://example.com/logo.png');
      expect(axios.get).toHaveBeenCalledWith(
        `https://hub.docker.com/api/media/repos_logo/v1/${imageName}`,
      );
    });

    it('should handle different image name formats', async () => {
      const imageName = 'user%2Fcustom-image';
      const mockResponse = {
        data: {
          url: 'https://example.com/custom-logo.png',
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.getImageLogo(imageName);

      expect(result).toBe('https://example.com/custom-logo.png');
      expect(axios.get).toHaveBeenCalledWith(
        `https://hub.docker.com/api/media/repos_logo/v1/${imageName}`,
      );
    });

    it('should handle API errors gracefully', async () => {
      const imageName = 'invalid-image';
      const error = new Error('Network error');

      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(service.getImageLogo(imageName)).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle missing URL in response', async () => {
      const imageName = 'library%2Fnginx';
      const mockResponse = {
        data: {},
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.getImageLogo(imageName);

      expect(result).toBeUndefined();
    });

    it('should handle network timeout errors', async () => {
      const imageName = 'library%2Fnginx';
      const error = new Error('Network timeout');

      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(service.getImageLogo(imageName)).rejects.toThrow(
        'Network timeout',
      );
    });

    it('should handle 404 errors for non-existent images', async () => {
      const imageName = 'nonexistent%2Fimage';
      const error = { response: { status: 404 } };

      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(service.getImageLogo(imageName)).rejects.toEqual(error);
    });
  });
});
