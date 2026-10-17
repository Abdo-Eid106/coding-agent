import { EntityManager } from '@mikro-orm/core';
import { Provider } from '../../../database/entities/provider.entity.js';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class RemoveApiKey {
  constructor(private readonly em: EntityManager) {}

  async execute(id: string) {
    const provider = await this.em.findOne(Provider, { id: id });

    if (!provider) {
      throw new NotFoundException('provider is not found');
    }

    delete provider.apiKey;
    await this.em.flush();
  }
}
