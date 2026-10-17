import { EntityManager } from '@mikro-orm/core';
import { stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { Project } from '../../../database/entities/project.entity.js';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AddProjectDto } from '../dto/add-project.dto.js';

@Injectable()
export class AddProject {
  constructor(private readonly em: EntityManager) {}

  async execute({ directory }: AddProjectDto): Promise<Project> {
    const path = resolve(directory);

    const info = await stat(path).catch((err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        throw new NotFoundException('there is no directory with this path');
      }

      throw err;
    });

    if (!info.isDirectory()) {
      throw new BadRequestException('path is not a directory');
    }

    const exists = await this.em.count(Project, { path });

    if (exists > 0) {
      throw new ConflictException('project already exists');
    }

    const project = this.em.create(Project, {
      name: basename(path),
      path,
    });

    await this.em.flush();

    return project;
  }
}
