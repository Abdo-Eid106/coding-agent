import { Factory } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { Session } from '../entities/session.entity.js';

export class SessionFactory extends Factory<Session> {
  readonly model = Session;

  definition(): EntityData<Session> {
    return {
      title: 'Session title',
    };
  }
}
