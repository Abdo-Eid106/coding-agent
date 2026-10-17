import { IsString } from 'class-validator';

export class AddMessageDto {
  @IsString()
  messageContent: string;
}
