import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller.js';
import { AddApiKey } from './use-cases/add-api-key.use-case.js';
import { GetConfiguredProviders } from './use-cases/get-configured-providers.use-case.js';
import { GetModel } from './use-cases/get-model.use-case.js';
import { RemoveApiKey } from './use-cases/remove-api-key.use-case.js';

@Module({
  controllers: [ProvidersController],
  providers: [AddApiKey, GetConfiguredProviders, GetModel, RemoveApiKey],
  exports: [GetModel],
})
export class ProvidersModule {}
