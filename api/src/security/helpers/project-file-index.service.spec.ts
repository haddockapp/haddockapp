import { Test, TestingModule } from '@nestjs/testing';
import { ProjectFileIndexService } from './project-file-index.service';
import * as fs from 'node:fs';
import * as path from 'node:path';

jest.mock('node:fs');
jest.mock('node:path');

describe('ProjectFileIndexService', () => {
  let service: ProjectFileIndexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectFileIndexService],
    }).compile();

    service = module.get<ProjectFileIndexService>(ProjectFileIndexService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('build', () => {
    it('should build file index from directory', async () => {
      const mockEntries = [
        { name: 'file1.ts', isDirectory: () => false, isFile: () => true },
        { name: 'file2.ts', isDirectory: () => false, isFile: () => true },
      ];

      (fs.readdirSync as jest.Mock).mockReturnValue(mockEntries);
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
      (path.relative as jest.Mock).mockImplementation((root, full) =>
        full.replace(root + '/', ''),
      );

      const result = await service.build('/test/project');

      expect(result.root).toBe('/test/project');
      expect(result.files).toBeInstanceOf(Map);
    });

    it('should ignore specified directories', async () => {
      const mockEntries = [
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
        { name: 'file.ts', isDirectory: () => false, isFile: () => true },
      ];

      (fs.readdirSync as jest.Mock).mockReturnValue(mockEntries);
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
      (path.relative as jest.Mock).mockImplementation((root, full) =>
        full.replace(root + '/', ''),
      );

      const result = await service.build('/test/project', {
        ignoreDirs: ['node_modules'],
      });

      expect(result.files.size).toBeGreaterThan(0);
    });

    it('should respect max depth option', async () => {
      const mockEntries = [
        { name: 'subdir', isDirectory: () => true, isFile: () => false },
        { name: 'file.ts', isDirectory: () => false, isFile: () => true },
      ];

      (fs.readdirSync as jest.Mock).mockReturnValue(mockEntries);
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
      (path.relative as jest.Mock).mockImplementation((root, full) =>
        full.replace(root + '/', ''),
      );

      const result = await service.build('/test/project', {
        maxDepth: 2,
      });

      expect(result).toBeDefined();
    });

    it('should handle empty directory', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));

      const result = await service.build('/test/empty');

      expect(result.files.size).toBe(0);
    });

    it('should group files by name', async () => {
      const mockEntries = [
        { name: 'file.ts', isDirectory: () => false, isFile: () => true },
        { name: 'file.ts', isDirectory: () => false, isFile: () => true },
      ];

      (fs.readdirSync as jest.Mock).mockReturnValue(mockEntries);
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
      (path.relative as jest.Mock).mockImplementation((root, full) =>
        full.replace(root + '/', ''),
      );

      const result = await service.build('/test/project');

      const fileList = result.files.get('file.ts');
      expect(fileList).toBeDefined();
      expect(fileList?.length).toBe(2);
    });
  });
});
