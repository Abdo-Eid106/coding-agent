import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { DeleteSession } from './use-cases/delete-session.use-case.js';
import { CreateSession } from './use-cases/create-session.use-case.js';

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly createSession: CreateSession,
    private readonly deleteSession: DeleteSession,
  ) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.createSession.execute(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteSession.execute(id);
  }
}
