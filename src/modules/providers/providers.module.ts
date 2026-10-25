import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller.js';
import { GetModel } from './use-cases/get-model.use-case.js';
import { AddProvider } from './use-cases/add-provider.use-case.js';
import { GetProviders } from './use-cases/get-providers.js';
import { DeleteProvider } from './use-cases/delete-provider.use-case.js';
import { UpdateProvider } from './use-cases/update-provider.use-case.js';

@Module({
  controllers: [ProvidersController],
  providers: [
    GetModel,
    GetProviders,
    AddProvider,
    DeleteProvider,
    UpdateProvider,
  ],
  exports: [GetModel],
})
export class ProvidersModule {}
