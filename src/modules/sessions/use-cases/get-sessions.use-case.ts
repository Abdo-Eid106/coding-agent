import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Project } from '../../../database/entities/project.entity.js';
import { Session } from '../../../database/entities/session.entity.js';

@Injectable()
export class GetSessions {
  constructor(private readonly em: EntityManager) {}

  async execute() {
    const [projects, sessions] = await Promise.all([
      this.em.find(
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
      ),

      this.em.find(
        Session,
        { project: null },
        {
          orderBy: {
            lastMessage: 'desc',
          },
        },
      ),
    ]);

    projects.sort((a, b) => {
      const aLastMessage = a.sessions[0]?.lastMessage?.getTime() ?? 0;
      const bLastMessage = b.sessions[0]?.lastMessage?.getTime() ?? 0;

      return bLastMessage - aLastMessage;
    });

    return {
      projects,
      sessions,
    };
  }
}
