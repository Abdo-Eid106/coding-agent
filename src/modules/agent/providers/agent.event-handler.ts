import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppEvent } from '../../events/enums/app-events.enum.js';
import { AgentService } from '../langchain/agent.service.js';

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
  constructor(private readonly agentService: AgentService) {}

  @OnEvent(AppEvent.AGENT_RUN_REQUESTED, { async: true })
  async handleAgentRunRequested(event: AgentRunRequestedEvent): Promise<void> {
    await this.agentService.run(event);
  }

  @OnEvent(AppEvent.AGENT_RESUME_REQUESTED, { async: true })
  async handleAgentResumeRequested(
    event: AgentResumeRequestedEvent,
  ): Promise<void> {
    await this.agentService.resume(event);
  }
}
