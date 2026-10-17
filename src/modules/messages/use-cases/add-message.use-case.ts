import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Session } from '../../../database/entities/session.entity.js';
import {
  Message,
  MessageRole,
} from '../../../database/entities/message.entity.js';
import { AddMessageDto } from '../dto/add-message.dto.js';
import { GetModel } from '../../providers/use-cases/get-model.use-case.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvent } from '../../events/enums/app-events.enum.js';

@Injectable()
export class AddMessage {
  constructor(
    private readonly em: EntityManager,
    private readonly getModel: GetModel,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    sessionId: string,
    dto: AddMessageDto,
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

    await this.getModel.execute(dto.modelId);

    const message = this.em.create(Message, {
      session: sessionId,
      role,
      id: dto.messageId,
      modelId: dto.modelId,
      content: dto.messageContent,
    });

    await this.em.flush();

    this.eventEmitter.emit(AppEvent.AGENT_RUN_REQUESTED, {
      messageId: message.id,
    });

    return { message };
  }
}
