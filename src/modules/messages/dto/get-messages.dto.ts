import { IsOptional, IsUUID } from 'class-validator';

export class GetMessagesDto {
  @IsUUID()
  @IsOptional()
  cursor?: string;
}
