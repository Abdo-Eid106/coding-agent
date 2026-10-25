import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogle } from '@langchain/google';
import { ChatAnthropic } from '@langchain/anthropic';

type ModelConfig = {
  modelId: string;
  apiKey: string;
  baseUrl?: string;
  provider: string;
};

export function ModelFactory(config: ModelConfig) {
  if (config.baseUrl) {
    return new ChatOpenAI({
      model: config.modelId,
      apiKey: config.apiKey,
      configuration: config.baseUrl ? { baseURL: config.baseUrl } : undefined,
    });
  }

  const provider = config.provider?.trim().toLowerCase();

  if (provider == 'gemini')
    return new ChatGoogle({
      model: config.modelId,
      apiKey: config.apiKey,
    });

  if (provider == 'anthropic') {
    return new ChatAnthropic({ model: config.modelId, apiKey: config.apiKey });
  }

  return new ChatOpenAI({
    model: config.modelId,
    apiKey: config.apiKey,
  });
}
