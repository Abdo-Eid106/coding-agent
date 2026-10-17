import { EntityManager } from '@mikro-orm/core';
import { Project } from '../../../database/entities/project.entity.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProjects {
  constructor(private readonly em: EntityManager) {}

  async execute() {
    return this.em.find(Project, {}, { populate: ['sessions'] });
  }
}
