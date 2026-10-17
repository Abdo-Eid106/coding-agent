import { IsString } from 'class-validator';

export class AddApiKeyDto {
  @IsString()
  apiKey: string;
}
