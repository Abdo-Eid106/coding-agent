import { Migration } from '@mikro-orm/migrations';

export class Migration20261017233810 extends Migration {

  override name = 'Migration20261017233810';

  override up(): void | Promise<void> {
    this.addSql(`alter table "message" add "model_id" varchar(255) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "message" drop column "model_id";`);
  }

}
