import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppEvent } from '../enums/app-events.enum.js';
import { AgentService } from './agent-service/agent.service.js';
import { ResumeInterruptDto } from '../dto/resume-interrupt.dto.js';
import { RunAgentDto } from '../dto/run-agent.dto.js';

@Injectable()
export class AgentEventsHandler {
  constructor(private readonly agentService: AgentService) {}

  @OnEvent(AppEvent.AGENT_RUN_REQUESTED, { async: true })
  async handleAgentRunRequested(event: RunAgentDto): Promise<void> {
    await this.agentService.run(event);
  }

  @OnEvent(AppEvent.AGENT_RESUME_REQUESTED, { async: true })
  async handleAgentResumeRequested(event: ResumeInterruptDto): Promise<void> {
    await this.agentService.resume(event);
  }
}
