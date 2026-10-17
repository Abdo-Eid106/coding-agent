import { EntityManager } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { Message } from '../../../database/entities/message.entity.js';
import { GetMessagesDto } from '../dto/get-messages.dto.js';
import { Injectable } from '@nestjs/common';

const DEFAULT_LIMIT = 20;

@Injectable()
export class GetMessages {
  constructor(private readonly em: EntityManager) {}

  async execute(sessionId: string, dto: GetMessagesDto) {
    const { cursor } = dto;
    const limit = DEFAULT_LIMIT;

    const where: FilterQuery<Message> = {
      parentMessage: null,
      session: { id: sessionId },
      ...(cursor && { id: { $lte: cursor } }),
    };

    const rows = await this.em.find(Message, where, {
      orderBy: { id: 'desc' },
      limit: limit + 1,
      populate: ['replies'],
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return {
      items: page.reverse(),
      nextCursor: hasMore ? rows.at(-1)?.id : undefined,
    };
  }
}
