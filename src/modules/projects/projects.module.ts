import { Module } from '@nestjs/common';
import { ProjectController } from './projects.controller.js';
import { AddProject } from './use-cases/add-project.use-case.js';
import { DeleteProject } from './use-cases/delete-project.use-case.js';
import { GetProjects } from './use-cases/get-projects.use-case.js';

@Module({
  controllers: [ProjectController],
  providers: [AddProject, DeleteProject, GetProjects],
})
export class ProjectModule {}
