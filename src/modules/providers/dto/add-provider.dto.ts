import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class AddModelDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;
}

export class AddProviderDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsString()
  baseUrl: string;

  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddModelDto)
  models: AddModelDto[];
}
