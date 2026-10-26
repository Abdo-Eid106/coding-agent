import { tool } from '@langchain/core/tools';
import type { RunnableConfig } from '@langchain/core/runnables';
import { spawn } from 'node:child_process';
import * as rg from '@vscode/ripgrep';
import path from 'node:path';
import z from 'zod';

interface GrepOptions {
  directory: string;
  pattern: string;
  isRegex?: boolean | undefined;
  ignoreCase?: boolean | undefined;
  globs?: string[] | undefined;
}

export function grep(
  {
    pattern,
    directory,
    isRegex = false,
    ignoreCase = false,
    globs = [],
  }: GrepOptions,
  signal?: AbortSignal,
): Promise<string> {
  const args: string[] = ['--line-number', '--json'];
  if (!isRegex) args.push('--fixed-strings');
  if (ignoreCase) args.push('-i');
  globs.forEach((glob) => args.push('-g', glob));

  return new Promise((resolve, reject) => {
    const child = spawn(
      rg.rgPath,
      [...args, '--', pattern, path.resolve(directory)],
      { signal },
    );

    let output = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      output += chunk;
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0 || code === 1) {
        resolve(output);
      } else {
        reject(new Error(`ripgrep exited with code ${code}`));
      }
    });
  });
}

export const grepTool = tool(
  async (input, config?: RunnableConfig) => {
    const content = await grep(input, config?.signal);
    return JSON.stringify({ content });
  },
  {
    name: 'grep',
    description:
      'Searches file contents in a directory using ripgrep and returns JSON-formatted match lines.',
    schema: z.object({
      directory: z.string().describe('The directory to search inside.'),
      pattern: z.string().describe('The text or regex pattern to search for.'),
      isRegex: z
        .boolean()
        .optional()
        .describe(
          'Whether to treat pattern as a regular expression (defaults to false).',
        ),
      ignoreCase: z
        .boolean()
        .optional()
        .describe(
          'Whether to perform a case-insensitive search (defaults to false).',
        ),
      globs: z
        .array(z.string())
        .optional()
        .describe(
          "Optional glob filters for including or excluding files (e.g., ['*.ts', '!**/test/**']).",
        ),
    }),
  },
);
