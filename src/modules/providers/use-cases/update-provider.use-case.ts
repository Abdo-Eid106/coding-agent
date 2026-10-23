import { EntityManager } from '@mikro-orm/core';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Provider } from '../../../database/entities/provider.entity.js';
import { AIModel } from '../../../database/entities/ai-model.entity.js';
import { UpdateProviderDto } from '../dto/update-provider.dto.js';

@Injectable()
export class UpdateProvider {
  constructor(private readonly em: EntityManager) {}

  async execute(id: string, dto: UpdateProviderDto) {
    const provider = await this.em.findOne(Provider, { id });

    if (!provider) {
      throw new NotFoundException('Provider not found.');
    }

    const modelIds = dto.models.map((model) => model.id);
    if (new Set(modelIds).size !== modelIds.length) {
      throw new ConflictException('Duplicate model IDs are not allowed.');
    }

    const existingModelCount = modelIds.length
      ? await this.em.count(AIModel, {
          id: { $in: modelIds },
          provider: { id: { $ne: id } },
        })
      : 0;

    if (existingModelCount > 0) {
      throw new ConflictException(
        'One or more of the specified AI models already exist.',
      );
    }

    this.em.assign(provider, {
      displayName: dto.displayName,
      baseUrl: dto.baseUrl,
      apiKey: dto.apiKey,
    });

    const existingModels = await this.em.find(AIModel, {
      provider: { id },
    });

    const incomingModelIds = new Set(modelIds);

    for (const model of existingModels) {
      if (!incomingModelIds.has(model.id)) {
        this.em.remove(model);
      }
    }

    for (const modelDto of dto.models) {
      const existingModel = existingModels.find(
        (model) => model.id === modelDto.id,
      );

      if (existingModel) {
        this.em.assign(existingModel, {
          displayName: modelDto.displayName,
        });
      } else {
        this.em.create(AIModel, {
          id: modelDto.id,
          displayName: modelDto.displayName,
          provider,
        });
      }
    }

    await this.em.flush();
  }
}
