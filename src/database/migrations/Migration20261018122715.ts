import { Migration } from '@mikro-orm/migrations';

export class Migration20261018122715 extends Migration {

  override name = 'Migration20261018122715';

  override up(): void | Promise<void> {
    this.addSql(`alter table "message" alter column "content" type text using ("content"::text);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "message" alter column "content" type varchar(255) using ("content"::varchar(255));`);
  }

}
