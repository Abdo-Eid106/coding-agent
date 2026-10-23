import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

export class AddModelDto {
  @IsString()
  id: string;

  @IsString()
  displayName: string;
}

export class UpdateProviderDto {
  @IsString()
  displayName: string;

  @IsString()
  baseUrl: string;

  @IsString()
  apiKey: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddModelDto)
  models: AddModelDto[];
}
