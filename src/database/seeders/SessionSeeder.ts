import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Project } from '../entities/project.entity.js';
import { Session } from '../entities/session.entity.js';
import { MessageRole } from '../entities/message.entity.js';
import { MessageFactory } from '../factories/message.factory.js';

export class SessionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const project = em.create(Project, {
      name: 'Demo Project',
      path: '/home/abdoeid/projects',
    });

    const session = em.create(Session, {
      title: 'Explore the codebase',
      project,
    });

    const messageFactory = new MessageFactory(em);

    for (let i = 0; i < 30; i++) {
      const message = messageFactory.makeOne({
        session,
        role: MessageRole.USER,
        content: `user message number ${i + 1}`,
      });

      messageFactory.makeOne({
        session,
        role: MessageRole.AI,
        content: `ai response number ${i + 1}`,
        parentMessage: message,
      });
    }

    await em.flush();
  }
}
