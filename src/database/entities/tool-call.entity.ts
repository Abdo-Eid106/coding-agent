import { Opt, type Rel } from '@mikro-orm/core';
import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { Message } from './message.entity.js';
import { randomUUID } from 'node:crypto';

@Entity()
export class ToolCall {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'varchar' })
  name: string;

  @Property({ type: 'json' })
  input: Record<string, unknown> = {};

  @Property({ type: 'json', nullable: true })
  output?: Record<string, unknown> & Opt;

  @Property({ type: 'datetime' })
  startedAt: Date = new Date();

  @Property({ type: 'datetime', nullable: true })
  finishedAt?: Date;

  @Index()
  @ManyToOne(() => Message)
  message: Rel<Message>;
}
