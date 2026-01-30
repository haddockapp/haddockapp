import { Injectable } from '@nestjs/common';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface FileEntry {
  readonly name: string;
  readonly relativePath: string;
  readonly absolutePath: string;
}

export interface ProjectFileIndex {
  readonly root: string;
  readonly files: Map<string, FileEntry[]>; // filename → FileEntry[]
}

@Injectable()
export class ProjectFileIndexService {
  async build(
    root: string,
    options?: {
      ignoreDirs?: string[];
      maxDepth?: number;
    },
  ): Promise<ProjectFileIndex> {
    const index: ProjectFileIndex = {
      root,
      files: new Map(),
    };

    await this.walk(
      root,
      root,
      index,
      options?.ignoreDirs ?? [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.vagrant',
      ],
      options?.maxDepth ?? 6,
    );

    return index;
  }

  private async walk(
    root: string,
    current: string,
    index: ProjectFileIndex,
    ignoreDirs: string[],
    maxDepth: number,
    depth = 0,
  ): Promise<void> {
    if (depth > maxDepth) return;

    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relPath = path.relative(root, fullPath);

      if (entry.isDirectory()) {
        if (ignoreDirs.includes(entry.name)) continue;
        await this.walk(root, fullPath, index, ignoreDirs, maxDepth, depth + 1);
        continue;
      }

      const list = index.files.get(entry.name) ?? [];
      list.push({
        name: entry.name,
        relativePath: relPath,
        absolutePath: fullPath,
      });
      index.files.set(entry.name, list);
    }
  }
}
