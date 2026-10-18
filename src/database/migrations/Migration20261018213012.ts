import { Migration } from '@mikro-orm/migrations';

export class Migration20261018213012 extends Migration {

  override name = 'Migration20261018213012';

  override up(): void | Promise<void> {
    this.addSql(`create table "tool_call" ("id" uuid not null, "name" varchar(255) not null, "input" jsonb not null, "output" jsonb null, "started_at" timestamptz not null, "finished_at" timestamptz null, "message_id" uuid not null, primary key ("id"));`);

    this.addSql(`alter table "tool_call" add constraint "tool_call_message_id_foreign" foreign key ("message_id") references "message" ("id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "tool_call" cascade;`);
  }

}
