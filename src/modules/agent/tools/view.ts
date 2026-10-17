import { tool } from "@langchain/core/tools";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import z from "zod";

interface viewOptions {
  filePath: string;
  startLine?: number | undefined;
  endLine?: number | undefined;
}

export async function view({
  filePath,
  startLine,
  endLine,
}: viewOptions): Promise<string> {
  const absolutePath = path.resolve(filePath);

  const info = await stat(absolutePath);
  if (!info.isFile()) {
    throw new Error("Invalid file path");
  }

  const content = await readFile(absolutePath, "utf8");
  const lines = content.split("\n");

  const start = startLine ?? 1;
  const end = endLine ?? lines.length;

  return lines
    .slice(start - 1, end)
    .map((line, index) => `${start + index}\t${line}`)
    .join("\n");
}

export const viewTool = tool(
  async (input) => {
    return await view(input);
  },
  {
    name: "view",
    description:
      "Reads a file and returns its contents with 1-based line numbers, optionally sliced between startLine and endLine.",
    schema: z.object({
      filePath: z
        .string()
        .describe("The path to the file to view."),
      startLine: z
        .number()
        .optional()
        .describe("1-based starting line number (inclusive)."),
      endLine: z
        .number()
        .optional()
        .describe("1-based ending line number (inclusive)."),
    }),
  },
);
