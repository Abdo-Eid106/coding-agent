import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { GetMessages } from './use-cases/get-messages.use-case.js';
import { AddMessage } from './use-cases/add-message.use-case.js';
import { AddMessageDto } from './dto/add-message.dto.js';

@Controller('sessions/:id/messages')
export class MessagesController {
  constructor(
    private readonly getMessages: GetMessages,
    private readonly addMessage: AddMessage,
  ) {}

  @Post()
  create(@Body() dto: AddMessageDto, @Param('id', ParseUUIDPipe) id: string) {
    return this.addMessage.execute(id, dto);
  }

  @Get()
  get(@Param('id', ParseUUIDPipe) sessionId: string) {
    return this.getMessages.execute(sessionId);
  }
}
