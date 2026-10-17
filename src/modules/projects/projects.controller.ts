import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AddProject } from './use-cases/add-project.use-case.js';
import { DeleteProject } from './use-cases/delete-project.use-case.js';
import { GetProjects } from './use-cases/get-projects.use-case.js';
import { AddProjectDto } from './dto/add-project.dto.js';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly addProject: AddProject,
    private readonly deleteProject: DeleteProject,
    private readonly getProjects: GetProjects,
  ) {}

  @Post()
  create(@Body() dto: AddProjectDto) {
    return this.addProject.execute(dto);
  }

  @Get()
  get() {
    return this.getProjects.execute();
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteProject.execute(id);
  }
}
