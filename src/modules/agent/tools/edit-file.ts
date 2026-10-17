import { tool } from "@langchain/core/tools";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import z from "zod";

export async function editFile(
  filePath: string,
  oldText: string,
  newText: string,
) {
  if (!filePath.trim()) {
    throw new Error("File path cannot be empty");
  }

  const absolutePath = path.resolve(filePath);

  const stats = await stat(absolutePath);
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${absolutePath}`);
  }

  const content = await readFile(absolutePath, "utf8");
  const index = content.indexOf(oldText);
  if (index == -1) {
    throw new Error("Old text not found in file");
  }
  if (content.indexOf(oldText, index + oldText.length) !== -1) {
    throw new Error(
      "Old text appears more than once; add more context to make it unique",
    );
  }

  const updated =
    content.slice(0, index) + newText + content.slice(index + oldText.length);
  await writeFile(absolutePath, updated, { encoding: "utf8" });
}

export const editFileTool = tool(
  async ({ filePath, oldText, newText }) => {
    await editFile(filePath, oldText, newText);
    return `Successfully edited file: ${filePath}`;
  },
  {
    name: "edit_file",
    description:
      "Replaces a unique occurrence of oldText with newText in a file.",
    schema: z.object({
      filePath: z.string().describe("Path to the file to edit."),
      oldText: z
        .string()
        .describe("Exact existing text in the file to be replaced (must be unique)."),
      newText: z
        .string()
        .describe("New replacement text."),
    }),
  },
);
