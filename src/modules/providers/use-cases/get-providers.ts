import { EntityManager } from '@mikro-orm/core';
import { Provider } from '../../../database/entities/provider.entity.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProviders {
  constructor(private readonly em: EntityManager) {}

  async execute() {
    return this.em.find(Provider, {}, { populate: ['models'] });
  }
}
