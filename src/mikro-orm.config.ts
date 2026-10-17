import 'dotenv/config';

import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { entities } from './database/entities/entities.js';
import { SeedManager } from '@mikro-orm/seeder';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL!,
  driver: PostgreSqlDriver,
  entities,
  extensions: [Migrator, SeedManager],
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
    emit: 'ts', // seeder generation mode
    fileName: (className: string) => className, // seeder file naming convention
  },
});
