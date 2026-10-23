import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AddApiKey } from './use-cases/add-api-key.use-case.js';
import { GetConfiguredProviders } from './use-cases/get-configured-providers.use-case.js';
import { RemoveApiKey } from './use-cases/remove-api-key.use-case.js';
import { AddApiKeyDto } from './dto/add-api-key.dto.js';
import { AddCustomProviderDto } from './dto/add-custom-provider.js';
import { AddCustomProvider } from './use-cases/add-custom-provider.use-case.js';
import { GetProviders } from './use-cases/get-providers.js';
import { DeleteProvider } from './use-cases/delete-provider.use-case.js';

@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly addApiKeyUsecase: AddApiKey,
    private readonly fetConfiguredProviders: GetConfiguredProviders,
    private readonly removeApiKey: RemoveApiKey,
    private readonly addCustomProvider: AddCustomProvider,
    private readonly getProviders: GetProviders,
    private readonly deleteProviderUseCase: DeleteProvider,
  ) {}

  @Get()
  findAll() {
    return this.getProviders.execute();
  }

  @Post()
  create(@Body() dto: AddCustomProviderDto) {
    return this.addCustomProvider.execute(dto);
  }

  @Post(':providerId/api-key')
  addApiKey(
    @Param('providerId') providerId: string,
    @Body() dto: AddApiKeyDto,
  ) {
    return this.addApiKeyUsecase.execute(providerId, dto);
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
