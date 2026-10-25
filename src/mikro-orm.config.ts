import 'dotenv/config';

import path from 'node:path';
import { defineConfig, SqliteDriver } from '@mikro-orm/sqlite';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import { entities } from './database/entities/entities.js';

export default defineConfig({
  dbName: path.resolve(process.cwd(), 'data', 'app.sqlite'),
  entities,
  extensions: [Migrator, SeedManager],
  driver: SqliteDriver,

  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'src/database/migrations',
    glob: '!(*.d).{js,ts,cjs}',
    silent: false,
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
    dropTables: true,
    safe: false,
    snapshot: true,
    snapshotOnMigrate: true,
    emit: 'ts',
  },

  seeder: {
    path: 'dist/database/seeders',
    pathTs: 'src/database/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className: string) => className,
  },
});
