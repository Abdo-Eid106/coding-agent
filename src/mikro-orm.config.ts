import 'dotenv/config';

import path from 'node:path';
import { defineConfig, SqliteDriver } from '@mikro-orm/sqlite';
import { Migrator } from '@mikro-orm/migrations';
import { entities } from './database/entities/entities.js';

export default defineConfig({
  dbName: path.resolve(process.cwd(), 'data', 'app.sqlite'),
  entities,
  extensions: [Migrator],
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
});
