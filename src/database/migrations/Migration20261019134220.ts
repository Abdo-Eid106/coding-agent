import { Migration } from '@mikro-orm/migrations';

export class Migration20261019134220 extends Migration {

  override name = 'Migration20261019134220';

  override up(): void | Promise<void> {
    this.addSql(`alter table "tool_call" drop constraint "tool_call_message_id_foreign";`);

    this.addSql(`alter table "tool_call" add constraint "tool_call_message_id_foreign" foreign key ("message_id") references "message" ("id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "tool_call" drop constraint "tool_call_message_id_foreign";`);

    this.addSql(`alter table "tool_call" add constraint "tool_call_message_id_foreign" foreign key ("message_id") references "message" ("id");`);
  }

}
