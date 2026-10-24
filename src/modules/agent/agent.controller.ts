import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResumeInterruptDto } from './dto/resume-interrupt.dto.js';
import { AppEvent } from '../events/enums/app-events.enum.js';

@Controller()
export class AgentConroller {
  constructor(private readonly em: EventEmitter2) {}

  @Post('resume-interrupt')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resume(@Body() dto: ResumeInterruptDto) {
    this.em.emit(AppEvent.AGENT_RESUME_REQUESTED, dto);
  }
}
