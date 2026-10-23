import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller.js';
import { AddApiKey } from './use-cases/add-api-key.use-case.js';
import { GetConfiguredProviders } from './use-cases/get-configured-providers.use-case.js';
import { GetModel } from './use-cases/get-model.use-case.js';
import { RemoveApiKey } from './use-cases/remove-api-key.use-case.js';
import { AddProvider } from './use-cases/add-provider.use-case.js';
import { GetProviders } from './use-cases/get-providers.js';
import { DeleteProvider } from './use-cases/delete-provider.use-case.js';
import { UpdateProvider } from './use-cases/update-provider.use-case.js';

@Module({
  controllers: [ProvidersController],
  providers: [
    AddApiKey,
    GetModel,
    RemoveApiKey,
    GetProviders,
    AddProvider,
    DeleteProvider,
    GetConfiguredProviders,
    UpdateProvider,
  ],
  exports: [GetModel],
})
export class ProvidersModule {}
