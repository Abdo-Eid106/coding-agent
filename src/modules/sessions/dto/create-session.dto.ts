import { IsOptional, IsString, IsUUID, isUUID } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsString()
  title: string;
}
