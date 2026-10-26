import { tool } from '@langchain/core/tools';
import type { RunnableConfig } from '@langchain/core/runnables';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import z from 'zod';

export interface LsOptions {
  directory: string;
  all?: boolean | undefined;
  sort?: boolean | undefined;
  limit?: number | undefined;
  recursive?: boolean | undefined;
  maxDepth?: number | undefined;
  ignore?: string[] | undefined;
}

export async function ls(
  {
    directory,
    all = false,
    sort = true,
    limit = 100,
    recursive = false,
    maxDepth = 2,
    ignore = [],
  }: LsOptions,
  signal?: AbortSignal,
) {
  signal?.throwIfAborted();
  const absolutePath = path.resolve(directory);
  const info = await stat(absolutePath);

  if (!info.isDirectory()) {
    throw new Error('Invalid directory path');
  }

  const results: {
    name: string;
    type: 'directory' | 'file';
    size?: number;
    modifiedAt?: string;
  }[] = [];

  async function walk(currentPath: string, depth: number) {
    signal?.throwIfAborted();
    const entries = await readdir(currentPath, { withFileTypes: true });
    const filtered = entries.filter(
      (entry) =>
        (all || !entry.name.startsWith('.')) && !ignore.includes(entry.name),
    );
    if (sort) {
      filtered.sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory())
          return a.isDirectory() ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    }

    for (const entry of filtered) {
      if (results.length >= limit) return;

      const entryPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(absolutePath, entryPath);
      const type = entry.isDirectory() ? 'directory' : 'file';

      results.push({
        name: relativePath,
        type,
      });

      if (
        recursive &&
        entry.isDirectory() &&
        depth < maxDepth &&
        results.length < limit
      ) {
        await walk(entryPath, depth + 1);
      }
    }
  }

  await walk(absolutePath, 1);

  return results;
}

export const lsTool = tool(
  async (input, config?: RunnableConfig) => {
    return JSON.stringify(await ls(input, config?.signal));
  },
  {
    name: 'ls',
    description: 'Lists files and directories inside a given directory path.',
    schema: z.object({
      directory: z.string().describe('The directory path to list contents of.'),
      all: z
        .boolean()
        .optional()
        .describe('Whether to include hidden dotfiles (defaults to false).'),
      sort: z
        .boolean()
        .optional()
        .describe(
          'Whether to sort directories first and alphabetically (defaults to true).',
        ),
      limit: z
        .number()
        .optional()
        .describe('Maximum number of entries to return (defaults to 100).'),
      recursive: z
        .boolean()
        .optional()
        .describe(
          'Whether to list subdirectories recursively (defaults to false).',
        ),
      maxDepth: z
        .number()
        .optional()
        .describe(
          'Maximum recursion depth when recursive is true (defaults to 2).',
        ),
      ignore: z.array(z.string()).optional().describe('Entry names to ignore.'),
    }),
  },
);
