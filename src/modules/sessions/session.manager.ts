import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvent } from '../agent/enums/app-events.enum.js';
import { SessionStatus } from './enum/session.status.js';
import {
  AgentEventEnum,
  SessionEvent,
} from '../agent/interfaces/agent-event.js';

@Injectable()
export class SessionManager {
  private readonly sessions = new Map<string, AbortController>();

  constructor(private readonly em: EventEmitter2) {}

  addSession(sessionId: string): AbortController {
    const existing = this.sessions.get(sessionId);
    if (existing) return existing;

    const controller = new AbortController();
    this.sessions.set(sessionId, controller);

    const event: SessionEvent = {
      type: AgentEventEnum.SESSION_STATUS,
      context: { sessionId },
      data: { status: SessionStatus.RUNNING },
    };

    this.em.emit(AppEvent.AGENT_EVENT, event);

    return controller;
  }

  removeSession(sessionId: string): void {
    const controller = this.sessions.get(sessionId);
    if (!controller) return;

    this.sessions.delete(sessionId);
    controller.abort();

    const event: SessionEvent = {
      type: AgentEventEnum.SESSION_STATUS,
      context: { sessionId },
      data: { status: SessionStatus.IDLE },
    };

    this.em.emit(AppEvent.AGENT_EVENT, event);
  }

  getRunningSessions() {
    return [...this.sessions.keys()];
  }

  getController(sessionId: string): AbortController | undefined {
    return this.sessions.get(sessionId);
  }
}
