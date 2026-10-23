import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

export class AddCustomModelDto {
  @IsString()
  modelId: string;

  @IsString()
  displayName: string;
}

export class AddCustomProviderDto {
  @IsString()
  providerId: string;

  @IsString()
  displayName: string;

  @IsString()
  baseUrl: string;

  @IsString()
  apiKey: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCustomModelDto)
  models: AddCustomModelDto[];
}
