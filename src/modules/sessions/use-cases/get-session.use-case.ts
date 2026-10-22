import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Session } from '../../../database/entities/session.entity.js';

@Injectable()
export class GetSession {
  constructor(private readonly em: EntityManager) {}

  async execute(id: string) {
    const session = await this.em.findOne(
      Session,
      { id },
      { populate: ['project'] },
    );

    if (!session) {
      throw new NotFoundException('session not found');
    }

    return session;
  }
}
