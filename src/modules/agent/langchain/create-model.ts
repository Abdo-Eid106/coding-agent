import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogle } from '@langchain/google';

type ModelConfig = {
  modelId: string;
  apiKey: string;
  baseUrl?: string;
  provider?: string;
};

export function createModel(config: ModelConfig) {
  if (config.provider?.trim().toLowerCase() == 'gemini')
    return new ChatGoogle({
      model: config.modelId,
      apiKey: config.apiKey,
    });

  return new ChatOpenAI({
    model: config.modelId,
    apiKey: config.apiKey,
    configuration: config.baseUrl ? { baseURL: config.baseUrl } : undefined,
  });
}
