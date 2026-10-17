import { Migration } from '@mikro-orm/migrations';

export class Migration20261017110819 extends Migration {

  override name = 'Migration20261017110819';

  override up(): void | Promise<void> {
    this.addSql(`create table "project" ("id" uuid not null, "name" varchar(255) not null, "path" varchar(255) not null, primary key ("id"));`);

    this.addSql(`create table "provider" ("id" varchar(255) not null, "name" varchar(255) not null, "api_key" varchar(255) null, "base_url" varchar(255) null, primary key ("id"));`);
    this.addSql(`alter table "provider" add constraint "provider_name_unique" unique ("name");`);

    this.addSql(`create table "aimodel" ("id" varchar(255) not null, "name" varchar(255) not null, "context_window" int null, "default_max_tokens" int null, "supports_attachments" boolean not null default false, "provider_id" varchar(255) not null, primary key ("id"));`);
    this.addSql(`create index "aimodel_provider_id_index" on "aimodel" ("provider_id");`);

    this.addSql(`create table "session" ("id" uuid not null, "title" varchar(255) null, "project_id" uuid null, primary key ("id"));`);

    this.addSql(`create table "message" ("id" uuid not null, "content" varchar(255) not null, "role" text not null, "created_at" timestamptz not null, "session_id" uuid not null, primary key ("id"));`);

    this.addSql(`alter table "aimodel" add constraint "aimodel_provider_id_foreign" foreign key ("provider_id") references "provider" ("id") on delete cascade;`);

    this.addSql(`alter table "session" add constraint "session_project_id_foreign" foreign key ("project_id") references "project" ("id") on delete set null;`);

    this.addSql(`alter table "message" add constraint "message_session_id_foreign" foreign key ("session_id") references "session" ("id") on delete cascade;`);
    this.addSql(`alter table "message" add constraint "message_role_check" check ("role" in ('user', 'ai'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "session" drop constraint "session_project_id_foreign";`);
    this.addSql(`alter table "aimodel" drop constraint "aimodel_provider_id_foreign";`);
    this.addSql(`alter table "message" drop constraint "message_session_id_foreign";`);

    this.addSql(`drop table if exists "project" cascade;`);
    this.addSql(`drop table if exists "provider" cascade;`);
    this.addSql(`drop table if exists "aimodel" cascade;`);
    this.addSql(`drop table if exists "session" cascade;`);
    this.addSql(`drop table if exists "message" cascade;`);
  }

}
