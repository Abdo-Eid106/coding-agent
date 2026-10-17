// test/factories/message.factory.ts
import { Factory } from '@mikro-orm/seeder';
import { faker } from '@faker-js/faker';
import { Message, MessageRole } from '../entities/message.entity.js';

export class MessageFactory extends Factory<Message> {
  model = Message;

  protected definition(): Partial<Message> {
    return {
      content: faker.lorem.sentence(),
      role: MessageRole.USER,
    };
  }
}
