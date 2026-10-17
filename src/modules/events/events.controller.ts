import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { AppEvent } from './enums/app-events.enum.js';
import { AgentStreamEvent } from '../agent/interfaces/agent-stream-event.js';

@Controller('events')
export class EventsController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Sse()
  streamEvents(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const onAgentEvent = (event: AgentStreamEvent) => {
        subscriber.next({
          type: event.type,
          data: event,
        });
      };

      const onAgentError = (event: {
        sessionId?: string;
        messageId: string;
        error: string;
      }) => {
        subscriber.next({
          type: 'error',
          data: event,
        });
      };

      this.eventEmitter.on(AppEvent.AGENT_STREAM_EVENT, onAgentEvent);
      this.eventEmitter.on(AppEvent.AGENT_STREAM_ERROR, onAgentError);

      return () => {
        this.eventEmitter.off(AppEvent.AGENT_STREAM_EVENT, onAgentEvent);
        this.eventEmitter.off(AppEvent.AGENT_STREAM_ERROR, onAgentError);
      };
    });
  }
}
