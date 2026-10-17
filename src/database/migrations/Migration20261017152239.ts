import { Migration } from '@mikro-orm/migrations';

export class Migration20261017152239 extends Migration {

  override name = 'Migration20261017152239';

  override up(): void | Promise<void> {
    this.addSql(`alter table "message" add "parent_message_id" uuid null;`);
    this.addSql(`alter table "message" add constraint "message_parent_message_id_foreign" foreign key ("parent_message_id") references "message" ("id") on delete set null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "message" drop constraint "message_parent_message_id_foreign";`);

    this.addSql(`alter table "message" drop column "parent_message_id";`);
  }

}
