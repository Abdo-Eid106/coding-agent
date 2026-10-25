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
import { AddProviderDto } from './dto/add-provider.dto.js';
import { AddProvider } from './use-cases/add-provider.use-case.js';
import { GetProviders } from './use-cases/get-providers.js';
import { DeleteProvider } from './use-cases/delete-provider.use-case.js';
import { UpdateProvider } from './use-cases/update-provider.use-case.js';
import { UpdateProviderDto } from './dto/update-provider.dto.js';

@Controller('providers')
export class ProvidersController {
  constructor(
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

  @Put(':providerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('providerId') id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    await this.updateProvider.execute(id, dto);
  }

  @Delete(':providerId')
  delete(@Param('providerId') providerId: string) {
    return this.deleteProviderUseCase.execute(providerId);
  }
}
