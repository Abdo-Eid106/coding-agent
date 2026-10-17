import { EntityManager } from '@mikro-orm/core';
import { Session } from '../../../database/entities/session.entity.js';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeleteSession {
  constructor(private readonly em: EntityManager) {}

  async execute(id: string) {
    const session = await this.em.findOne(Session, { id }, { fields: ['id'] });
    if (!session) {
      throw new NotFoundException('session not found');
    }

    this.em.remove(session);
    await this.em.flush();
  }
}
