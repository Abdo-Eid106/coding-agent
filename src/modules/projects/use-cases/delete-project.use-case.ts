import { EntityManager } from '@mikro-orm/core';
import { Project } from '../../../database/entities/project.entity.js';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteProject {
  constructor(private readonly em: EntityManager) {}

  async execute(id: string) {
    const project = await this.em.findOne(Project, { id }, { fields: ['id'] });

    if (!project) {
      throw new BadRequestException('project is not found');
    }

    this.em.remove(project);
    await this.em.flush();
  }
}
