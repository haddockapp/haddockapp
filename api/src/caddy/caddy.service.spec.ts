import { Test, TestingModule } from '@nestjs/testing';
import { CaddyService } from './caddy.service';
import { execCommand } from '../utils/exec-utils';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('handlebars');
jest.mock('../utils/exec-utils', () => ({
  execCommand: jest.fn(),
}));

describe('CaddyService', () => {
  let service: CaddyService;
  let readFileSync: jest.Mock;
  let writeFile: jest.Mock;
  let compile: jest.Mock;

  beforeEach(async () => {
    const fs = require('fs');
    const fsPromises = require('fs/promises');
    const handlebars = require('handlebars');

    readFileSync = fs.readFileSync = jest.fn();
    writeFile = fsPromises.writeFile = jest.fn().mockResolvedValue(undefined);
    compile = handlebars.compile = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CaddyService],
    }).compile();

    service = module.get<CaddyService>(CaddyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should generate Caddy configuration file', async () => {
      const mockTemplate = '{{hostname}}';
      const mockCompiled = jest.fn().mockReturnValue('example.com');
      readFileSync.mockReturnValue(mockTemplate);
      compile.mockReturnValue(mockCompiled);
      (execCommand as jest.Mock).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      });

      await service.generate({
        template: 'reverse-proxies.hbs',
        data: {
          data: [{ hostname: 'example.com', ip: '127.0.0.1', port: 8080 }],
        },
        dest: '/tmp/caddy.conf',
      });

      expect(readFileSync).toHaveBeenCalled();
      expect(compile).toHaveBeenCalledWith(mockTemplate);
      expect(mockCompiled).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalled();
      expect(execCommand).toHaveBeenCalled();
    });

    it('should cache compiled templates', async () => {
      const mockTemplate = '{{hostname}}';
      const mockCompiled = jest.fn().mockReturnValue('example.com');
      readFileSync.mockReturnValue(mockTemplate);
      compile.mockReturnValue(mockCompiled);
      (execCommand as jest.Mock).mockResolvedValue({
        stdout: '',
        stderr: '',
        exitCode: 0,
      });

      await service.generate({
        template: 'reverse-proxies.hbs',
        data: {
          data: [{ hostname: 'example.com', ip: '127.0.0.1', port: 8080 }],
        },
        dest: '/tmp/caddy.conf',
      });

      await service.generate({
        template: 'reverse-proxies.hbs',
        data: {
          data: [{ hostname: 'test.com', ip: '127.0.0.1', port: 9090 }],
        },
        dest: '/tmp/caddy2.conf',
      });

      expect(compile).toHaveBeenCalledTimes(1);
      expect(readFileSync).toHaveBeenCalledTimes(1);
    });
  });
});
