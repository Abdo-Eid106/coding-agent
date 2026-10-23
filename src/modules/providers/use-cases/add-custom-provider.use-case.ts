import { EntityManager } from '@mikro-orm/core';
import { ConflictException, Injectable } from '@nestjs/common';
import { AddCustomProviderDto } from '../dto/add-custom-provider.js';
import { Provider } from '../../../database/entities/provider.entity.js';
import { AIModel } from '../../../database/entities/ai-model.entity.js';

@Injectable()
export class AddCustomProvider {
  constructor(private readonly em: EntityManager) {}

  async execute(dto: AddCustomProviderDto) {
    const { providerId, displayName, baseUrl, apiKey, models } = dto;
    const modelIds = models.map((m) => m.modelId);

    const [existingProviderCount, existingModelCount] = await Promise.all([
      this.em.count(Provider, { id: providerId }),
      modelIds.length > 0
        ? this.em.count(AIModel, { id: { $in: modelIds } })
        : 0,
    ]);

    if (existingProviderCount > 0) {
      throw new ConflictException(
        `Provider with ID '${providerId}' already exists.`,
      );
    }

    if (existingModelCount > 0) {
      throw new ConflictException(
        'One or more of the specified AI models already exist.',
      );
    }

    const provider = this.em.create(Provider, {
      id: providerId,
      name: displayName,
      baseUrl,
      apiKey,
    });

    for (const model of models) {
      this.em.create(AIModel, {
        id: model.modelId,
        name: model.displayName,
        provider,
      });
    }

    await this.em.flush();
  }
}
