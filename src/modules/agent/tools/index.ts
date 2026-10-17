import { bashTool } from "./bash.js";
import { editFileTool } from "./edit-file.js";
import { fetchTool } from "./fetch.js";
import { globTool } from "./glob.js";
import { grepTool } from "./grep.js";
import { lsTool } from "./ls.js";
import { viewTool } from "./view.js";
import { writeTool } from "./write.js";

export const builtInTools = [
  bashTool,
  editFileTool,
  fetchTool,
  globTool,
  grepTool,
  lsTool,
  viewTool,
  writeTool,
];
