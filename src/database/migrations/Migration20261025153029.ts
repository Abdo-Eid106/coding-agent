import { Migration } from '@mikro-orm/migrations';

export class Migration20261025153029 extends Migration {

  override name = 'Migration20261025153029';

  override up(): void | Promise<void> {
    this.addSql(`alter table "message" add "command_approval_mode" text null;`);
    this.addSql(`alter table "message" add constraint "message_command_approval_mode_check" check ("command_approval_mode" in ('always_ask', 'ask_unless_allowlisted', 'never_ask'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "message" drop constraint "message_command_approval_mode_check";`);
    this.addSql(`alter table "message" drop column "command_approval_mode";`);
  }

}
