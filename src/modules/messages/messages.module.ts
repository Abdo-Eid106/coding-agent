import { Module } from '@nestjs/common';
import { GetMessages } from './use-cases/get-messages.use-case.js';
import { AddMessage } from './use-cases/add-message.use-case.js';
import { MessagesController } from './messages.controller.js';

@Module({
  providers: [GetMessages, AddMessage],
  controllers: [MessagesController],
})
export class MessagesModule {}
