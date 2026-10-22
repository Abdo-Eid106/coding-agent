import { tool } from '@langchain/core/tools';
import type { RunnableConfig } from '@langchain/core/runnables';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import z from 'zod';

interface WriteOptions {
  filePath: string;
  content: string;
  overwrite?: boolean | undefined;
}

export async function write(
  { filePath, content, overwrite = true }: WriteOptions,
  signal?: AbortSignal,
): Promise<void> {
  signal?.throwIfAborted();
  const absolutePath = path.resolve(filePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });

  // Last chance to abort. The write itself is not given the signal on purpose,
  // so an abort can't leave a truncated file.
  signal?.throwIfAborted();
  await writeFile(absolutePath, content, {
    encoding: 'utf8',
    flag: overwrite ? 'w' : 'wx',
  });
}

export const writeTool = tool(
  async (input, config?: RunnableConfig) => {
    await write(input, config?.signal);
    return { content: `Successfully wrote to file: ${input.filePath}` };
  },
  {
    name: 'write',
    description:
      'Writes content to a file, creating parent directories if needed.',
    schema: z.object({
      filePath: z.string().describe('The target file path to write to.'),
      content: z.string().describe('The text content to write into the file.'),
      overwrite: z
        .boolean()
        .optional()
        .describe(
          'Whether to overwrite the file if it already exists (defaults to true).',
        ),
    }),
  },
);
