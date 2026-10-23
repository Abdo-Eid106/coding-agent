import { EntityManager } from '@mikro-orm/core';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Provider } from '../../../database/entities/provider.entity.js';
import { ProviderEnum } from '../enums/provider.enum.js';

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

    if (
      Object.values(ProviderEnum).some(
        (value) => value == provider.id.toLowerCase(),
      )
    ) {
      throw new BadRequestException('Cannot delete default built-in providers');
    }

    this.em.remove(provider);
    await this.em.flush();
  }
}
