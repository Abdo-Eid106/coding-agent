import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMessageDto {
  @IsString()
  modelId: string;

  @IsOptional()
  @IsUUID('7')
  messageId?: string;

  @IsString()
  messageContent: string;
}
