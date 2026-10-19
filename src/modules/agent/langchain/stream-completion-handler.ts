import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AgentEventEnum,
  AgentStreamEvent,
} from '../interfaces/agent-stream-event.js';
import { AppEvent } from '../../events/enums/app-events.enum.js';
import { GraphStream } from './agent-graph.factory.js';

@Injectable()
export class StreamCompletionHandler {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async execute(
    ctx: { messageId: string; sessionId: string },
    result: GraphStream,
  ): Promise<void> {
    return this.withErrorHandling(async () => {
      const event: AgentStreamEvent = result.interrupted
        ? {
            type: AgentEventEnum.INTERRUPT,
            sessionId: ctx.sessionId,
            messageId: ctx.messageId,
            payload: result.interrupts[0],
          }
        : {
            type: AgentEventEnum.DONE,
            sessionId: ctx.sessionId,
            messageId: ctx.messageId,
            payload: null,
          };

      this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);
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
