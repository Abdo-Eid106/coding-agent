import { HumanMessage } from '@langchain/core/messages';
import { Command } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';

import {
  AgentGraphFactory,
  type AgentGraph,
  type GraphInput,
  type AgentGraphContext,
} from './agent-graph.factory.js';

import {
  ToolsProjectionHandler,
  toolEventsTransformer,
} from './projections/tools-projection-handler.js';
import { MessagesProjectionHandler } from './projections/messages-projection-handler.js';
import { StreamCompletionHandler } from './projections/stream-completion-handler.js';
import { EntityManager } from '@mikro-orm/core';
import {
  Message,
  MessageRole,
} from '../../../database/entities/message.entity.js';
import { AIModel } from '../../../database/entities/ai-model.entity.js';

interface RunAgentDto {
  messageId: string;
}

interface ResumeAgentDto {
  messageId: string;
  interruptId: string;
  payload: object;
}

@Injectable()
export class AgentService {
  private readonly graph: AgentGraph;

  constructor(
    graphFactory: AgentGraphFactory,
    private readonly toolsProjectionHandler: ToolsProjectionHandler,
    private readonly messagesProjectionHandler: MessagesProjectionHandler,
    private readonly streamCompletionHandler: StreamCompletionHandler,
    private readonly em: EntityManager,
  ) {
    this.graph = graphFactory.create();
  }

  async run({ messageId }: RunAgentDto) {
    const { message, context } = await this.prepareRun(messageId);

    const input: GraphInput = {
      messages: [new HumanMessage(message.content)],
      workingDirectory: message.session.project?.path,
    };

    await this.stream(input, message.session.id, context);
  }

  async resume(dto: ResumeAgentDto) {
    const { messageId, interruptId, payload } = dto;
    const { message, context } = await this.prepareRun(messageId);

    const input: GraphInput = new Command({
      resume: { [interruptId]: payload },
    });

    await this.stream(input, message.session.id, context);
  }

  private async stream(
    input: GraphInput,
    threadId: string,
    context: AgentGraphContext,
  ) {
    const stream = await this.graph.streamEvents(input, {
      configurable: { thread_id: threadId },
      recursionLimit: 100,
      context,
      version: 'v3',
      transformers: [toolEventsTransformer],
    });

    await Promise.all([
      this.toolsProjectionHandler.execute(
        { messageId: context.messageId, sessionId: threadId },
        stream.extensions.tools,
      ),
      this.messagesProjectionHandler.execute(
        { messageId: context.messageId, sessionId: threadId },
        stream.messages,
      ),
    ]);

    await this.streamCompletionHandler.execute(
      {
        messageId: context.messageId,
        sessionId: threadId,
      },
      stream,
    );
  }

  private async prepareRun(messageId: string) {
    const message = await this.em.findOne(
      Message,
      { id: messageId },
      { populate: ['session', 'session.project'] },
    );

    if (!message) {
      throw new Error(`Message ${messageId} was not found`);
    }

    if (message.role !== MessageRole.USER) {
      throw new Error(`Message ${messageId} is not a user message`);
    }

    const model = await this.em.findOne(
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
