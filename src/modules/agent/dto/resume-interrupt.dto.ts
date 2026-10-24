import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class InterruptPayload {
  @IsString()
  selectedId: string;
}

export class ResumeInterruptDto {
  @IsString()
  interruptId: string;

  @IsString()
  messageId: string;

  @ValidateNested()
  @Type(() => InterruptPayload)
  payload: InterruptPayload;
}
