import { ChatModelStream } from '@langchain/langgraph';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AgentEventEnum,
  TokenEvent,
} from '../interfaces/agent-stream-event.js';
import {
  Message,
  MessageRole,
} from '../../../database/entities/message.entity.js';
import { AppEvent } from '../../events/enums/app-events.enum.js';

type ChatModelStreamHandle = Omit<ChatModelStream, 'then'>;

@Injectable()
export class MessagesProjectionHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    ctx: { messageId: string; sessionId: string },
    projection: AsyncIterable<ChatModelStreamHandle>,
  ) {
    return this.withErrorHandling(async () => {
      const { messageId, sessionId } = ctx;
      const reply = this.em.create(Message, {
        role: MessageRole.AI,
        content: '',
        session: sessionId,
        parentMessage: messageId,
      });

      for await (const message of projection) {
        for await (const token of message.text) {
          reply.content += token;

          const event: TokenEvent = {
            type: AgentEventEnum.TOKEN,
            sessionId: ctx.sessionId,
            messageId: ctx.messageId,
            payload: {
              token,
              replyId: reply.id,
            },
          };

          this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);
        }
      }
      await this.em.flush();
    });
  }

  private async withErrorHandling(
    operation: () => Promise<void>,
  ): Promise<void> {
    try {
      await operation();
    } catch (error: unknown) {
      this.eventEmitter.emit(AppEvent.AGENT_STREAM_ERROR, {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }
}
