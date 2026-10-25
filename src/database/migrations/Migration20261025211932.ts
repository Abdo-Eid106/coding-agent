import { Migration } from '@mikro-orm/migrations';

export class Migration20261025211932 extends Migration {

  override name = 'Migration20261025211932';

  override up(): void | Promise<void> {
    this.addSql(`alter table "tool_call" add "error" jsonb null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "tool_call" drop column "error";`);
  }

}
