import { Opt, type Rel } from '@mikro-orm/core';
import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy';
import { Message } from './message.entity.js';
import { randomUUID } from 'node:crypto';

@Entity()
export class ToolCall {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Unique()
  @Property({ type: 'varchar' })
  toolCallId: string;

  @Property({ type: 'varchar' })
  name: string;

  @Property({ type: 'json' })
  input: unknown & Opt = {};

  @Property({ type: 'json', nullable: true })
  output?: unknown & Opt;

  @Property({ type: 'json', nullable: true })
  error?: unknown & Opt;

  @Property({ type: 'datetime' })
  startedAt: Date & Opt = new Date();

  @Property({ type: 'datetime', nullable: true })
  finishedAt?: Date & Opt;

  @Index()
  @ManyToOne(() => Message, { deleteRule: 'cascade' })
  message: Rel<Message>;
}
