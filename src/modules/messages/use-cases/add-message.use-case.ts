import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Session } from '../../../database/entities/session.entity.js';
import {
  Message,
  MessageRole,
} from '../../../database/entities/message.entity.js';
import { AddMessageDto } from '../dto/add-message.dto.js';

@Injectable()
export class AddMessage {
  constructor(private readonly em: EntityManager) {}

  async execute(
    sessionId: string,
    { messageContent }: AddMessageDto,
    role: MessageRole = MessageRole.USER,
  ) {
    const session = await this.em.findOne(
      Session,
      { id: sessionId },
      { fields: ['id'] },
    );
    if (!session) {
      throw new NotFoundException('session not found');
    }

    const message = this.em.create(Message, {
      session: sessionId,
      content: messageContent,
      role,
    });

    await this.em.flush();

    return { message };
  }
}
