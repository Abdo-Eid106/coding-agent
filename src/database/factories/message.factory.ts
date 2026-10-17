// test/factories/message.factory.ts
import { Factory } from '@mikro-orm/seeder';
import type { EntityData } from '@mikro-orm/core';
import { faker } from '@faker-js/faker';
import { Message, MessageRole } from '../entities/message.entity.js';
import { SessionFactory } from './session.factory.js';

export class MessageFactory extends Factory<Message> {
  model = Message;

  protected definition(): EntityData<Message> {
    return {
      content: faker.lorem.sentence(),
      session: new SessionFactory(this.em).makeOne(),
      role: MessageRole.USER,
    };
  }
}
