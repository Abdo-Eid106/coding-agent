import { EntityManager } from '@mikro-orm/core';
import { AIModel } from '../../../database/entities/ai-model.entity.js';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetModel {
  constructor(private readonly em: EntityManager) {}

  async execute(modelId: string) {
    const aiModel = await this.em.findOne(
      AIModel,
      { id: modelId, provider: { apiKey: { $ne: null } } },
      { populate: ['provider'] },
    );

    if (!aiModel)
      throw new NotFoundException(
        'Model not found or has no API key configured',
      );

    return aiModel;
  }
}
