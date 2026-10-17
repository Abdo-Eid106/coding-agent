import { IsString } from 'class-validator';

export class AddProjectDto {
  @IsString()
  directory: string;
}
