import { Factory } from '@mikro-orm/seeder';
import { Session } from '../entities/session.entity.js';

export class SessionFactory extends Factory<Session> {
  readonly model = Session;

  definition(): Partial<Session> {
    return {
      title: 'Session title',
    };
  }
}
