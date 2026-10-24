import { IsString } from 'class-validator';

export class RunAgentDto {
  @IsString()
  messageId: string;
}
