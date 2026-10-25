import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Post,
  Sse,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResumeInterruptDto } from './dto/resume-interrupt.dto.js';
import { AppEvent } from './enums/app-events.enum.js';
import { ToolManager } from './providers/tool-manager.js';
import { Observable } from 'rxjs';
import { AgentEvent } from './interfaces/agent-event.js';

@Controller()
export class AgentConroller {
  constructor(
    private readonly em: EventEmitter2,
    private readonly toolManager: ToolManager,
  ) {}

  @Post('resume-interrupt')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resume(@Body() dto: ResumeInterruptDto) {
    this.em.emit(AppEvent.AGENT_RESUME_REQUESTED, dto);
  }

  @Get('mcp-servers')
  async get() {
    return this.toolManager.getMcpServers();
  }

  @Post('reload-mcp-servers')
  async reload() {
    return await this.toolManager.reload();
  }

  @Sse('events')
  streamEvents(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const onAgentEvent = (event: AgentEvent) => {
        subscriber.next({
          type: event.type,
          data: event,
        });
      };

      this.em.on(AppEvent.AGENT_EVENT, onAgentEvent);
      return () => {
        this.em.off(AppEvent.AGENT_EVENT, onAgentEvent);
      };
    });
  }
}
