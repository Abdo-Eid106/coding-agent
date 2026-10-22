import { ChatModelStream } from '@langchain/langgraph';
import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AgentEventEnum,
  TokenEvent,
} from '../../interfaces/agent-stream-event.js';
import {
  Message,
  MessageRole,
} from '../../../../database/entities/message.entity.js';
import { AppEvent } from '../../../events/enums/app-events.enum.js';

type ChatModelStreamHandle = Omit<ChatModelStream, 'then'>;

interface ProjectionContext {
  messageId: string;
  sessionId: string;
}

@Injectable()
export class MessagesProjectionHandler {
  private readonly logger = new Logger(MessagesProjectionHandler.name);

  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    ctx: ProjectionContext,
    projection: AsyncIterable<ChatModelStreamHandle>,
  ): Promise<Message> {
    const em = this.em.fork();

    const reply = em.create(Message, {
      role: MessageRole.AI,
      content: '',
      session: ctx.sessionId,
      parentMessage: ctx.messageId,
    });

    try {
      await this.streamTokens(ctx, reply, projection);
    } catch (error: unknown) {
      this.logger.error(
        `Projection failed for session ${ctx.sessionId}`,
        error,
      );
      this.emitError(ctx, error);
    } finally {
      await em.flush();
    }

    return reply;
  }

  private async streamTokens(
    ctx: ProjectionContext,
    reply: Message,
    projection: AsyncIterable<ChatModelStreamHandle>,
  ): Promise<void> {
    for await (const modelStream of projection) {
      for await (const token of modelStream.text) {
        reply.content += token;
        this.emitToken(ctx, reply.id, token);
      }
    }
  }

  private emitToken(ctx: ProjectionContext, replyId: string, token: string) {
    const event: TokenEvent = {
      type: AgentEventEnum.TOKEN,
      sessionId: ctx.sessionId,
      messageId: ctx.messageId,
      payload: { token, replyId },
    };
    this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);
  }

  private emitError(ctx: ProjectionContext, error: unknown) {
    this.eventEmitter.emit(AppEvent.AGENT_STREAM_ERROR, {
      sessionId: ctx.sessionId,
      messageId: ctx.messageId,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
}
