import { EntityManager } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { Message } from '../../../database/entities/message.entity.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetMessages {
  constructor(private readonly em: EntityManager) {}

  async execute(sessionId: string) {
    return this.em.find(
      Message,
      {
        parentMessage: null,
        session: { id: sessionId },
      },
      {
        orderBy: { id: 'desc' },
        populate: ['replies', 'toolCalls'],
        populateOrderBy: {
          toolCalls: { startedAt: 'ASC' },
        },
      },
    );
  }
}
