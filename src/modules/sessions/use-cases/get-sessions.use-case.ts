import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Session } from '../../../database/entities/session.entity.js';
import { Project } from '../../../database/entities/project.entity.js';

@Injectable()
export class GetSessions {
  constructor(private readonly em: EntityManager) {}

  async execute() {
    const projects = await this.em.find(
      Project,
      {},
      {
        populate: ['sessions'],
        populateOrderBy: {
          sessions: {
            lastMessage: 'desc',
          },
        },
      },
    );

    projects.sort((a, b) => {
      const at = a.sessions[0]?.lastMessage?.getTime() ?? 0;
      const bt = b.sessions[0]?.lastMessage?.getTime() ?? 0;
      return bt - at;
    });

    const sessions = await this.em.find(
      Session,
      { project: null },
      { orderBy: { lastMessage: 'desc' } },
    );

    return { projects, sessions };
  }
}
