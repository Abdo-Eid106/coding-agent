import { EntityManager } from '@mikro-orm/core';
import { ConflictException, Injectable } from '@nestjs/common';
import { AddProviderDto } from '../dto/add-provider.dto.js';
import { Provider } from '../../../database/entities/provider.entity.js';
import { AIModel } from '../../../database/entities/ai-model.entity.js';

@Injectable()
export class AddProvider {
  constructor(private readonly em: EntityManager) {}

  async execute(dto: AddProviderDto) {
    const { id, displayName, baseUrl, apiKey, models } = dto;
    const modelIds = models.map((m) => m.id);

    if (new Set(modelIds).size !== modelIds.length) {
      throw new ConflictException('Duplicate model IDs are not allowed.');
    }

    const existingProviderCount = await this.em.count(Provider, { id });
    if (existingProviderCount > 0) {
      throw new ConflictException(`Provider with ID '${id}' already exists.`);
    }

    const provider = this.em.create(Provider, {
      id,
      displayName,
      baseUrl,
      apiKey,
    });

    for (const model of models) {
      this.em.create(AIModel, {
        id: model.id,
        displayName: model.displayName,
        provider,
      });
    }

    await this.em.flush();
  }
}
