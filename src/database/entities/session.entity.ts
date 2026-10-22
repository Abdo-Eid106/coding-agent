import {
  Entity,
  Formula,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { Project } from './project.entity.js';
import { Collection, type Opt } from '@mikro-orm/core';
import { Message } from './message.entity.js';

@Entity()
export class Session {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'varchar', nullable: true })
  title: string;

  @ManyToOne(() => Project, { nullable: true, deleteRule: 'set null' })
  project?: Project;

  @OneToMany(() => Message, (message) => message.session)
  messages = new Collection<Message>(this);

  @Formula(
    (alias) =>
      `(SELECT MAX(m.created_at)
      FROM message m
      WHERE m.session_id = ${alias}.id)`,
    {
      type: Date,
    },
  )
  lastMessage?: Date | null;
}
