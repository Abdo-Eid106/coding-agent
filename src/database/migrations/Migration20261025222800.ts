import { Migration } from '@mikro-orm/migrations';

export class Migration20261025222800 extends Migration {
  override name = 'Migration20261025222800';

  override up(): void {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS \`agent_settings\` (
        \`id\` TEXT NOT NULL PRIMARY KEY,
        \`command_approval_mode\` TEXT
          CHECK (\`command_approval_mode\` IN ('always_ask', 'ask_unless_allowlisted', 'never_ask'))
          NOT NULL DEFAULT 'ask_unless_allowlisted',
        \`updated_at\` DATETIME NOT NULL
      );
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS \`project\` (
        \`id\` TEXT NOT NULL PRIMARY KEY,
        \`name\` TEXT NOT NULL,
        \`path\` TEXT NOT NULL
      );
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS \`provider\` (
        \`id\` TEXT NOT NULL PRIMARY KEY,
        \`display_name\` TEXT NOT NULL,
        \`api_key\` TEXT NULL,
        \`base_url\` TEXT NULL
      );
    `);

    this.addSql(`
      CREATE UNIQUE INDEX IF NOT EXISTS \`provider_display_name_unique\`
      ON \`provider\` (\`display_name\`);
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS \`aimodel\` (
        \`id\` TEXT NOT NULL PRIMARY KEY,
        \`display_name\` TEXT NOT NULL,
        \`provider_id\` TEXT NOT NULL,
        CONSTRAINT \`aimodel_provider_id_foreign\`
          FOREIGN KEY (\`provider_id\`)
          REFERENCES \`provider\` (\`id\`)
          ON DELETE CASCADE
      );
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS \`aimodel_provider_id_index\`
      ON \`aimodel\` (\`provider_id\`);
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS \`session\` (
        \`id\` TEXT NOT NULL PRIMARY KEY,
        \`title\` TEXT NULL,
        \`project_id\` TEXT NULL,
        CONSTRAINT \`session_project_id_foreign\`
          FOREIGN KEY (\`project_id\`)
          REFERENCES \`project\` (\`id\`)
          ON DELETE SET NULL
      );
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS \`session_project_id_index\`
      ON \`session\` (\`project_id\`);
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS \`message\` (
        \`id\` TEXT NOT NULL PRIMARY KEY,
        \`content\` TEXT NOT NULL,
        \`model_id\` TEXT NULL,
        \`command_approval_mode\` TEXT
          CHECK (\`command_approval_mode\` IN ('always_ask', 'ask_unless_allowlisted', 'never_ask'))
          NULL,
        \`role\` TEXT CHECK (\`role\` IN ('user', 'ai')) NOT NULL,
        \`created_at\` DATETIME NOT NULL,
        \`session_id\` TEXT NOT NULL,
        \`parent_message_id\` TEXT NULL,
        CONSTRAINT \`message_session_id_foreign\`
          FOREIGN KEY (\`session_id\`)
          REFERENCES \`session\` (\`id\`)
          ON DELETE CASCADE,
        CONSTRAINT \`message_parent_message_id_foreign\`
          FOREIGN KEY (\`parent_message_id\`)
          REFERENCES \`message\` (\`id\`)
          ON DELETE SET NULL
      );
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS \`message_session_id_index\`
      ON \`message\` (\`session_id\`);
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS \`message_parent_message_id_index\`
      ON \`message\` (\`parent_message_id\`);
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS \`tool_call\` (
        \`id\` TEXT NOT NULL PRIMARY KEY,
        \`tool_call_id\` TEXT NOT NULL,
        \`name\` TEXT NOT NULL,
        \`input\` JSON NOT NULL,
        \`output\` JSON NULL,
        \`error\` JSON NULL,
        \`started_at\` DATETIME NOT NULL,
        \`finished_at\` DATETIME NULL,
        \`message_id\` TEXT NOT NULL,
        CONSTRAINT \`tool_call_message_id_foreign\`
          FOREIGN KEY (\`message_id\`)
          REFERENCES \`message\` (\`id\`)
          ON DELETE CASCADE
      );
    `);

    this.addSql(`
      CREATE UNIQUE INDEX IF NOT EXISTS \`tool_call_tool_call_id_unique\`
      ON \`tool_call\` (\`tool_call_id\`);
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS \`tool_call_message_id_index\`
      ON \`tool_call\` (\`message_id\`);
    `);
  }

  override down(): void {
    this.addSql('DROP TABLE IF EXISTS `tool_call`;');
    this.addSql('DROP TABLE IF EXISTS `message`;');
    this.addSql('DROP TABLE IF EXISTS `session`;');
    this.addSql('DROP TABLE IF EXISTS `aimodel`;');
    this.addSql('DROP TABLE IF EXISTS `provider`;');
    this.addSql('DROP TABLE IF EXISTS `project`;');
    this.addSql('DROP TABLE IF EXISTS `agent_settings`;');
  }
}
