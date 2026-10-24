import { Migration } from '@mikro-orm/migrations';

export class Migration20261024154525 extends Migration {

  override name = 'Migration20261024154525';

  override up(): void | Promise<void> {
    this.addSql(`alter table "aimodel" drop column "context_window", drop column "default_max_tokens", drop column "supports_attachments";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "aimodel" add "context_window" int null, add "default_max_tokens" int null, add "supports_attachments" boolean not null default false;`);
  }

}
