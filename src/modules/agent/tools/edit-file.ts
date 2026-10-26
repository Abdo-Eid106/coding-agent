import { tool } from '@langchain/core/tools';
import type { RunnableConfig } from '@langchain/core/runnables';
import { readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import z from 'zod';

export async function editFile(
  filePath: string,
  oldText: string,
  newText: string,
  signal?: AbortSignal,
) {
  if (!filePath.trim()) {
    throw new Error('File path cannot be empty');
  }
  if (!oldText) {
    throw new Error('oldText cannot be empty');
  }

  signal?.throwIfAborted();
  const absolutePath = path.resolve(filePath);

  const stats = await stat(absolutePath);
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${absolutePath}`);
  }

  signal?.throwIfAborted();
  const content = await readFile(absolutePath, { encoding: 'utf8', signal });

  const index = content.indexOf(oldText);
  if (index === -1) {
    throw new Error('Old text not found in file');
  }
  if (content.indexOf(oldText, index + oldText.length) !== -1) {
    throw new Error(
      'Old text appears more than once; add more context to make it unique',
    );
  }

  const updated =
    content.slice(0, index) + newText + content.slice(index + oldText.length);

  signal?.throwIfAborted();

  const tmpPath = `${absolutePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(tmpPath, updated, { encoding: 'utf8', mode: stats.mode });
    await rename(tmpPath, absolutePath);
  } catch (err) {
    await rm(tmpPath, { force: true });
    throw err;
  }

  return { original: content, modified: updated };
}

export const editFileTool = tool(
  async ({ filePath, oldText, newText }, config?: RunnableConfig) => {
    return JSON.stringify(
      await editFile(filePath, oldText, newText, config?.signal),
    );
  },
  {
    name: 'edit_file',
    description:
      'Replaces a unique occurrence of oldText with newText in a file.',
    schema: z.object({
      filePath: z.string().describe('Path to the file to edit.'),
      oldText: z
        .string()
        .describe(
          'Exact existing text in the file to be replaced (must be unique).',
        ),
      newText: z.string().describe('New replacement text.'),
    }),
  },
);
