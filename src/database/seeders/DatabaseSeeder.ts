import { Seeder } from '@mikro-orm/seeder';
import { SessionSeeder } from './SessionSeeder.js';
import { ProviderSeeder } from './ProviderSeeder.js';
import { EntityManager } from '@mikro-orm/core';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [ProviderSeeder, SessionSeeder]);
  }
}
