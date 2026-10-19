import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  Message,
  MessageRole,
} from '../../../database/entities/message.entity.js';
import { AIModel } from '../../../database/entities/ai-model.entity.js';
import { AppEvent } from '../../events/enums/app-events.enum.js';
import {
  AgentEventEnum,
  TokenEvent,
  ToolCallEvent,
} from '../interfaces/agent-stream-event.js';
import type { AgentGraphContext } from '../langchain/agent-graph.factory.js';
import { AgentService } from '../langchain/agent.service.js';
import { ToolCall } from '../../../database/entities/tool-call.entity.js';

export interface PreparedAgentRun {
  message: Message;
  context: AgentGraphContext;
}

interface AgentRunRequestedEvent {
  messageId: string;
}

interface AgentResumeRequestedEvent {
  messageId: string;
  interruptId: string;
  payload: object;
}

@Injectable()
export class AgentExecutionService {
  private readonly logger = new Logger(AgentExecutionService.name);

  constructor(
    private readonly agentService: AgentService,
    private readonly eventEmitter: EventEmitter2,
    private readonly em: EntityManager,
  ) {}

  async run(event: AgentRunRequestedEvent): Promise<void> {
    try {
      const { message, context } = await this.prepareRun(event.messageId);
      const reply = this.createReply(message);

      const stream = this.agentService.run({
        threadId: message.session.id,
        message: message.content,
        workingDirectory: message.session.project?.path,
        context,
      });

      for await (const event of stream) {
        if (event.type === AgentEventEnum.TOKEN) {
          reply.content += (event as TokenEvent).payload.token;
          this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, {
            ...event,
            payload: {
              ...(event as TokenEvent).payload,
              replyId: reply.id,
            },
          } as TokenEvent);
        } else if (event.type == AgentEventEnum.TOOL_START) {
          const { payload } = event as ToolCallEvent;
          this.em.create(ToolCall, {
            toolCallId: payload.toolCallId,
            input: payload.input!,
            name: payload.name,
            message,
          });
          this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);
        } else if (event.type == AgentEventEnum.TOOL_END) {
          const { payload } = event as ToolCallEvent;

          const toolCall = (await this.em.findOne(ToolCall, {
            toolCallId: payload.toolCallId,
          }))!;
          toolCall.output = payload.output;
          toolCall.finishedAt = new Date();

          this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);
        }
      }
    } catch (error) {
      this.handleError(event.messageId, error);
    } finally {
      await this.em.flush();
    }
  }

  async resume(event: AgentResumeRequestedEvent): Promise<void> {
    try {
      const { message, context } = await this.prepareRun(event.messageId);
      const reply = this.createReply(message);

      const stream = this.agentService.resume({
        threadId: message.session.id,
        interruptId: event.interruptId,
        payload: event.payload,
        context,
      });

      for await (const event of stream) {
        if (event.type === AgentEventEnum.TOKEN) {
          reply.content += event.payload;
          this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, {
            ...event,
            payload: {
              ...(event as TokenEvent).payload,
              replyId: reply.id,
            },
          } as TokenEvent);
        } else if (
          event.type == AgentEventEnum.TOOL_START ||
          event.type == AgentEventEnum.TOOL_END
        ) {
          const { payload } = event as ToolCallEvent;
          this.em.create(ToolCall, {
            toolCallId: payload.toolCallId,
            input: payload.input!,
            name: payload.name,
            message,
          });
          this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);
        }
      }
    } catch (error) {
      this.handleError(event.messageId, error);
    } finally {
      await this.em.flush();
    }
  }

  private createReply(parent: Message): Message {
    return this.em.create(Message, {
      role: MessageRole.AI,
      content: '',
      session: parent.session,
      parentMessage: parent,
    });
  }

  private handleError(messageId: string, error: unknown): void {
    this.logger.error(
      `Failed to handle agent event for message ${messageId}`,
      error instanceof Error ? error.stack : String(error),
    );

    this.eventEmitter.emit(AppEvent.AGENT_STREAM_ERROR, {
      messageId,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }

  private async prepareRun(messageId: string): Promise<PreparedAgentRun> {
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
