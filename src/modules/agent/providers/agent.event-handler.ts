import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { AgentService } from './agent.service.js';
import { PrepareAgentRun } from './prepare-agent-run.js';
import type { AgentStreamEvent } from '../interfaces/agent-stream-event.js';
import { AppEvent } from '../../events/enums/app-events.enum.js';

interface AgentRunRequestedEvent {
  messageId: string;
}

interface AgentResumeRequestedEvent {
  messageId: string;
  interruptId: string;
  payload: object;
}

@Injectable()
export class AgentEventsHandler {
  private readonly logger = new Logger(AgentEventsHandler.name);

  constructor(
    private readonly prepareAgentRun: PrepareAgentRun,
    private readonly agentService: AgentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(AppEvent.AGENT_RUN_REQUESTED, { async: true })
  async handleAgentRunRequested(event: AgentRunRequestedEvent): Promise<void> {
    try {
      const { message, context } = await this.prepareAgentRun.execute(
        event.messageId,
      );

      const stream = this.agentService.run({
        threadId: message.session.id,
        message: message.content,
        context,
      });

      await this.publishEvents(stream);
    } catch (error) {
      this.handleError(event.messageId, error);
    }
  }

  @OnEvent(AppEvent.AGENT_RESUME_REQUESTED, { async: true })
  async handleAgentResumeRequested(
    event: AgentResumeRequestedEvent,
  ): Promise<void> {
    try {
      const { message, context } = await this.prepareAgentRun.execute(
        event.messageId,
      );

      const stream = this.agentService.resume({
        threadId: message.session.id,
        interruptId: event.interruptId,
        payload: event.payload,
        context,
      });

      await this.publishEvents(stream);
    } catch (error) {
      this.handleError(event.messageId, error);
    }
  }

  private async publishEvents(
    stream: AsyncGenerator<AgentStreamEvent>,
  ): Promise<void> {
    for await (const event of stream) {
      this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);
    }
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
}
