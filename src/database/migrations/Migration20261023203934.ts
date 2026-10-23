import { Migration } from '@mikro-orm/migrations';

export class Migration20261023203934 extends Migration {

  override name = 'Migration20261023203934';

  override up(): void | Promise<void> {
    this.addSql(`alter table "provider" drop constraint "provider_name_unique";`);
    this.addSql(`alter table "provider" rename column "name" to "display_name";`);
    this.addSql(`alter table "provider" add constraint "provider_display_name_unique" unique ("display_name");`);

    this.addSql(`alter table "aimodel" rename column "name" to "display_name";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "aimodel" rename column "display_name" to "name";`);

    this.addSql(`alter table "provider" drop constraint "provider_display_name_unique";`);
    this.addSql(`alter table "provider" rename column "display_name" to "name";`);
    this.addSql(`alter table "provider" add constraint "provider_name_unique" unique ("name");`);
  }

}
