import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { Provider } from './provider.entity.js';
import { Opt } from '@mikro-orm/core';

@Entity()
export class AIModel {
  @PrimaryKey({ type: 'varchar' })
  id: string;

  @Property({ type: 'varchar' })
  name: string;

  @Property({ nullable: true, type: 'int' })
  contextWindow?: number & Opt;

  @Property({ nullable: true, type: 'int' })
  defaultMaxTokens?: number & Opt;

  @Property({ default: false, type: 'boolean' })
  supportsAttachments: boolean & Opt = false;

  @Index()
  @ManyToOne(() => Provider, { deleteRule: 'cascade' })
  provider: Provider;
}
