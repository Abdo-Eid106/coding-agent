import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Provider } from '../../../database/entities/provider.entity.js';

@Injectable()
export class DeleteProvider {
  constructor(private readonly em: EntityManager) {}

  async execute(id: string) {
    const provider = await this.em.findOne(
      Provider,
      { id },
      { populate: ['models'] },
    );

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    this.em.remove(provider);
    await this.em.flush();
  }
}
