import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Provider } from '../../../database/entities/provider.entity.js';
import { AddApiKeyDto } from '../dto/add-api-key.dto.js';

@Injectable()
export class AddApiKey {
  constructor(private readonly em: EntityManager) {}

  async execute(providerId: string, { apiKey }: AddApiKeyDto) {
    const provider = await this.em.findOne(Provider, { id: providerId });

    if (!provider) {
      throw new NotFoundException('provider is not found');
    }

    provider.apiKey = apiKey;
    await this.em.flush();
  }
}
