import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AgentEventEnum,
  DoneEvent,
  Interrupt,
  InterruptEvent,
  ErrorEvent,
} from '../../../interfaces/agent-event.js';
import { AppEvent } from '../../../enums/app-events.enum.js';
import { GraphStream } from '../agent-graph.factory.js';

@Injectable()
export class StreamCompletionHandler {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async execute(
    ctx: { messageId: string; sessionId: string },
    result: GraphStream,
  ): Promise<void> {
    return this.withErrorHandling(async () => {
      const event: InterruptEvent | DoneEvent = result.interrupted
        ? {
            type: AgentEventEnum.INTERRUPT,
            context: ctx,
            data: result.interrupts[0] as Interrupt,
          }
        : {
            type: AgentEventEnum.DONE,
            context: ctx,
            data: null,
          };

      this.eventEmitter.emit(AppEvent.AGENT_EVENT, event);
    });
  }

  private async withErrorHandling(
    operation: () => Promise<void>,
  ): Promise<void> {
    try {
      await operation();
    } catch (error: unknown) {
      if (this.isAbortError(error)) return;

      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      const event: ErrorEvent = {
        type: AgentEventEnum.ERROR,
        context: {},
        data: { message },
      };

      this.eventEmitter.emit(AppEvent.AGENT_EVENT, event);
    }
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'APIUserAbortError')
    );
  }
}
