import { tool } from "@langchain/core/tools";
import fg from "fast-glob";
import path from "node:path";
import z from "zod";

export interface SearchFilesInput {
  directory: string;
  pattern: string;
  limit?: number | undefined;
  ignore?: string[] | undefined;
  maxDepth?: number | undefined;
}

export interface SearchFilesResult {
  files: string[];
  total: number;
  truncated: boolean;
}

const DEFAULT_IGNORE = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
];

export async function glob({
  directory,
  pattern,
  limit = 100,
  ignore = [],
  maxDepth = 10,
}: SearchFilesInput): Promise<SearchFilesResult> {
  const matches = await fg(pattern, {
    cwd: path.resolve(directory),
    onlyFiles: true,
    dot: true,
    deep: maxDepth,
    ignore: [...DEFAULT_IGNORE, ...ignore],
    followSymbolicLinks: false,
    suppressErrors: true,
    unique: true,
  });

  const files = matches.sort().slice(0, limit);

  return {
    files,
    total: matches.length,
    truncated: matches.length > limit,
  };
}

export const globTool = tool(
  async (input) => {
    const result = await glob(input);
    return JSON.stringify(result);
  },
  {
    name: "glob",
    description:
      "Finds files matching a glob pattern inside a directory and returns the matched file paths.",
    schema: z.object({
      directory: z
        .string()
        .describe("The base directory to search in."),
      pattern: z
        .string()
        .describe("The glob pattern to match files against (e.g., '**/*.ts')."),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of file results to return (defaults to 100)."),
      ignore: z
        .array(z.string())
        .optional()
        .describe("Additional glob patterns to ignore."),
      maxDepth: z
        .number()
        .optional()
        .describe("Maximum directory traversal depth (defaults to 10)."),
    }),
  },
);
