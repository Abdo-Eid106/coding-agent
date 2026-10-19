import { Migration } from '@mikro-orm/migrations';

export class Migration20261019125655 extends Migration {

  override name = 'Migration20261019125655';

  override up(): void | Promise<void> {
    this.addSql(`alter table "tool_call" add "tool_call_id" varchar(255) not null;`);
    this.addSql(`alter table "tool_call" add constraint "tool_call_tool_call_id_unique" unique ("tool_call_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "tool_call" drop constraint "tool_call_tool_call_id_unique";`);
    this.addSql(`alter table "tool_call" drop column "tool_call_id";`);
  }

}
