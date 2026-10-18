import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogle } from '@langchain/google';
import { SystemMessage } from '@langchain/core/messages';

type ModelConfig = {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string | undefined;
};

export function createModel(config: ModelConfig) {
  switch (config.provider) {
    case 'openai':
      return new ChatOpenAI({
        model: config.model,
        apiKey: config.apiKey,
      });

    case 'anthropic':
      return new ChatAnthropic({
        model: config.model,
        apiKey: config.apiKey,
      });

    case 'gemini':
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
