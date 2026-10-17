import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GetMessages } from './use-cases/get-messages.use-case.js';
import { AddMessage } from './use-cases/add-message.use-case.js';
import { AddMessageDto } from './dto/add-message.dto.js';
import { GetMessagesDto } from './dto/get-messages.dto.js';

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
  get(@Param('id', ParseUUIDPipe) id: string, @Query() query: GetMessagesDto) {
    return this.getMessages.execute(id, query);
  }
}
