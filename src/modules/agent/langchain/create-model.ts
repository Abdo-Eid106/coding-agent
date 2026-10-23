import { ChatOpenAI } from '@langchain/openai';

type ModelConfig = {
  modelId: string;
  apiKey: string;
  baseUrl?: string;
};

export function createModel(config: ModelConfig) {
  return new ChatOpenAI({
    model: config.modelId,
    apiKey: config.apiKey,
    configuration: config.baseUrl ? { baseURL: config.baseUrl } : undefined,
  });
}
