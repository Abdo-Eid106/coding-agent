import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { AppEvent } from './enums/app-events.enum.js';
import { AgentStreamEvent } from '../agent/interfaces/agent-stream-event.js';
import { SessionStatus } from '../sessions/enum/session.status.js';

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

      const onSessionStatusChanged = (event: {
        sessionId: string;
        status: SessionStatus;
      }) => {
        subscriber.next({
          type: 'session_status',
          data: event,
        });
      };

      this.eventEmitter.on(AppEvent.AGENT_STREAM_EVENT, onAgentEvent);
      this.eventEmitter.on(AppEvent.AGENT_STREAM_ERROR, onAgentError);
      this.eventEmitter.on(
        AppEvent.AGENT_SESSION_STATUS_CHANGED,
        onSessionStatusChanged,
      );

      return () => {
        this.eventEmitter.off(AppEvent.AGENT_STREAM_EVENT, onAgentEvent);
        this.eventEmitter.off(AppEvent.AGENT_STREAM_ERROR, onAgentError);
        this.eventEmitter.off(
          AppEvent.AGENT_SESSION_STATUS_CHANGED,
          onSessionStatusChanged,
        );
      };
    });
  }
}
