import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AddApiKey } from './use-cases/add-api-key.use-case.js';
import { GetConfiguredProviders } from './use-cases/get-configured-providers.use-case.js';
import { RemoveApiKey } from './use-cases/remove-api-key.use-case.js';
import { AddApiKeyDto } from './dto/add-api-key.dto.js';

@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly addApiKey: AddApiKey,
    private readonly fetConfiguredProviders: GetConfiguredProviders,
    private readonly removeApiKey: RemoveApiKey,
  ) {}

  @Post(':providerId/api-key')
  create(@Param('providerId') providerId: string, @Body() dto: AddApiKeyDto) {
    return this.addApiKey.execute(providerId, dto);
  }

  @Delete(':providerId/api-key')
  remove(@Param('providerId') providerId: string) {
    return this.removeApiKey.execute(providerId);
  }

  @Get('configured')
  get() {
    return this.fetConfiguredProviders.execute();
  }
}
