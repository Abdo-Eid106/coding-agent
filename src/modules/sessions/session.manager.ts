import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvent } from '../events/enums/app-events.enum.js';

export enum AgentSessionStatus {
  RUNNING = 'running',
  IDLE = 'idle',
}

@Injectable()
export class SessionManager {
  private readonly sessions = new Map<string, AbortController>();

  constructor(private readonly em: EventEmitter2) {}

  addSession(sessionId: string): AbortController {
    const existing = this.sessions.get(sessionId);
    if (existing) return existing;

    const controller = new AbortController();
    this.sessions.set(sessionId, controller);

    this.em.emit(AppEvent.AGENT_SESSION_STATUS_CHANGED, {
      sessionId,
      status: AgentSessionStatus.RUNNING,
    });

    return controller;
  }

  removeSession(sessionId: string): void {
    const controller = this.sessions.get(sessionId);
    if (!controller) return;

    this.sessions.delete(sessionId);
    controller.abort();

    this.em.emit(AppEvent.AGENT_SESSION_STATUS_CHANGED, {
      sessionId,
      status: AgentSessionStatus.IDLE,
    });
  }

  getRunninSessions() {
    return [...this.sessions.keys()];
  }

  getController(sessionId: string): AbortController | undefined {
    return this.sessions.get(sessionId);
  }
}
