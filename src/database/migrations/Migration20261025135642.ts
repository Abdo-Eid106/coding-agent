import { Migration } from '@mikro-orm/migrations';

export class Migration20261025135642 extends Migration {

  override name = 'Migration20261025135642';

  override up(): void | Promise<void> {
    this.addSql(`create table "agent_settings" ("id" uuid not null, "command_approval_mode" text not null default 'ask_unless_allowlisted', "updated_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "agent_settings" add constraint "agent_settings_command_approval_mode_check" check ("command_approval_mode" in ('always_ask', 'ask_unless_allowlisted', 'never_ask'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "agent_settings" cascade;`);
  }

}
