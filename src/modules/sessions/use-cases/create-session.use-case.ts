import { EntityManager } from '@mikro-orm/core';
import { Session } from '../../../database/entities/session.entity.js';
import { Project } from '../../../database/entities/project.entity.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from '../dto/create-session.dto.js';

@Injectable()
export class CreateSession {
  constructor(private readonly em: EntityManager) {}

  async execute({ title, projectId }: CreateSessionDto) {
    const project = projectId ? await this.findProject(projectId) : null;
    const session = this.em.create(Session, { title, project });
    await this.em.flush();
    return session;
  }

  private async findProject(projectId: string) {
    const project = await this.em.findOne(Project, { id: projectId });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
