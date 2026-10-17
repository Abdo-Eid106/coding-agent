import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsString()
  title: string;
}
