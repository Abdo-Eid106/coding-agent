import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { entities } from './entities/entities.js';

@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({})],
      driver: PostgreSqlDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          clientUrl: config.getOrThrow('DATABASE_URL'),
          driver: PostgreSqlDriver,
          entities,
          allowGlobalContext: true,
        };
      },
    }),
  ],
})
export class TestDatabaseModule {}
