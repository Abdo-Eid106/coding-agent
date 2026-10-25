import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { SqliteDriver } from '@mikro-orm/sqlite';
import path from 'node:path';
import { entities } from './entities/entities.js';

const databasePath = path.resolve(process.cwd(), 'data', 'app.sqlite');

@Global()
@Module({
  imports: [
    MikroOrmModule.forRoot({
      driver: SqliteDriver,
      dbName: databasePath,
      entities,
    }),
  ],
})
export class DatabaseModule {}