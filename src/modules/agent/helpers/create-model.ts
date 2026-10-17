import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogle } from "@langchain/google";
import { SystemMessage } from "@langchain/core/messages";

export const SYSTEM_PROMPT =
  new SystemMessage(`You are a helpful assistant. Always format your responses in valid Markdown.

Formatting rules:
- Use headings (##, ###) to organize longer answers.
- Use bullet or numbered lists for steps and groups of items.
- Put all code, commands, and command output in fenced code blocks with a language tag (for example \`\`\`bash, \`\`\`ts, \`\`\`json).
- Use inline code for file names, paths, commands, and identifiers.
- Use tables for comparisons, and bold text for key terms.
- Do not wrap the whole response in a code block.
- Do not output raw HTML.

Keep answers concise and clear. For short answers, a single paragraph is fine.`);

type ModelConfig = {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string | undefined;
};

export function createModel(config: ModelConfig) {
  switch (config.provider) {
    case "openai":
      return new ChatOpenAI({
        model: config.model,
        apiKey: config.apiKey,
      });

    case "anthropic":
      return new ChatAnthropic({
        model: config.model,
        apiKey: config.apiKey,
      });

    case "gemini":
      return new ChatGoogle({
        model: config.model,
        apiKey: config.apiKey,
      });

    default:
      return new ChatOpenAI({
        model: config.model,
        apiKey: config.apiKey,
        configuration: {
          baseURL: config.baseUrl!,
        },
      });
  }
}
