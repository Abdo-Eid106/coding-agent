import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { DeleteSession } from './use-cases/delete-session.use-case.js';
import { CreateSession } from './use-cases/create-session.use-case.js';
import { GetSession } from './use-cases/get-session.use-case.js';
import { GetSessions } from './use-cases/get-sessions.use-case.js';

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly createSession: CreateSession,
    private readonly deleteSession: DeleteSession,
    private readonly getSession: GetSession,
    private readonly getSessions: GetSessions,
  ) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.createSession.execute(dto);
  }

  @Get()
  getAll() {
    return this.getSessions.execute();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getSession.execute(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteSession.execute(id);
  }
}
