import { Migration } from '@mikro-orm/migrations';

export class Migration20261018213108 extends Migration {

  override name = 'Migration20261018213108';

  override up(): void | Promise<void> {
    this.addSql(`create index "tool_call_message_id_index" on "tool_call" ("message_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop index "tool_call_message_id_index";`);
  }

}
