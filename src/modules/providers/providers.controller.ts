import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AddApiKey } from './use-cases/add-api-key.use-case.js';
import { GetConfiguredProviders } from './use-cases/get-configured-providers.use-case.js';
import { RemoveApiKey } from './use-cases/remove-api-key.use-case.js';
import { AddApiKeyDto } from './dto/add-api-key.dto.js';
import { AddProviderDto } from './dto/add-provider.dto.js';
import { AddProvider } from './use-cases/add-provider.use-case.js';
import { GetProviders } from './use-cases/get-providers.js';
import { DeleteProvider } from './use-cases/delete-provider.use-case.js';
import { UpdateProvider } from './use-cases/update-provider.use-case.js';
import { UpdateProviderDto } from './dto/update-provider.dto.js';

@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly addApiKeyUsecase: AddApiKey,
    private readonly fetConfiguredProviders: GetConfiguredProviders,
    private readonly removeApiKey: RemoveApiKey,
    private readonly addProvider: AddProvider,
    private readonly getProviders: GetProviders,
    private readonly deleteProviderUseCase: DeleteProvider,
    private readonly updateProvider: UpdateProvider,
  ) {}

  @Get()
  findAll() {
    return this.getProviders.execute();
  }

  @Post()
  create(@Body() dto: AddProviderDto) {
    return this.addProvider.execute(dto);
  }

  @Post(':providerId/api-key')
  addApiKey(
    @Param('providerId') providerId: string,
    @Body() dto: AddApiKeyDto,
  ) {
    return this.addApiKeyUsecase.execute(providerId, dto);
  }

  @Put(':providerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('providerId') id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    await this.updateProvider.execute(id, dto);
  }

  @Delete(':providerId/api-key')
  remove(@Param('providerId') providerId: string) {
    return this.removeApiKey.execute(providerId);
  }

  @Delete(':providerId')
  delete(@Param('providerId') providerId: string) {
    return this.deleteProviderUseCase.execute(providerId);
  }

  @Get('configured')
  getConfigured() {
    return this.fetConfiguredProviders.execute();
  }
}
