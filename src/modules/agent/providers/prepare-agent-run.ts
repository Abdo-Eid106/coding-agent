import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import {
  Message,
  MessageRole,
} from '../../../database/entities/message.entity.js';
import { AIModel } from '../../../database/entities/ai-model.entity.js';
import { AgentGraphContext } from './agent-graph.factory.js';

export interface PreparedAgentRun {
  message: Message;
  context: AgentGraphContext;
}

@Injectable()
export class PrepareAgentRun {
  constructor(private readonly em: EntityManager) {}

  async execute(messageId: string): Promise<PreparedAgentRun> {
    const em = this.em.fork();

    const message = await em.findOne(
      Message,
      { id: messageId },
      { populate: ['session'] },
    );

    if (!message) {
      throw new Error(`Message ${messageId} was not found`);
    }

    if (message.role !== MessageRole.USER) {
      throw new Error(`Message ${messageId} is not a user message`);
    }

    const model = await em.findOne(
      AIModel,
      { id: message.modelId },
      { populate: ['provider'] },
    );

    if (!model) {
      throw new Error(`AI model ${message.modelId} was not found`);
    }

    const provider = model.provider;
    if (!provider.apiKey) {
      throw new Error(`Provider ${provider.name} has no configured API key`);
    }

    return {
      message,
      context: {
        modelConfig: {
          provider: provider.name,
          model: model.name,
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl ?? '',
        },
        messageId: message.id,
      },
    };
  }
}
