import {
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { randomUUIDv7 } from 'node:crypto';
import { Session } from './session.entity.js';
import { Collection, type Opt } from '@mikro-orm/core';
import { ToolCall } from './tool-call.entity.js';

export enum MessageRole {
  USER = 'user',
  AI = 'ai',
}

@Entity()
export class Message {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUIDv7();

  @Property({ type: 'text' })
  content: string;

  @Property({ type: 'varchar', nullable: true })
  modelId?: string & Opt;

  @Enum(() => MessageRole)
  role: MessageRole;

  @Property()
  createdAt: Date & Opt = new Date();

  @ManyToOne(() => Session, { deleteRule: 'cascade' })
  session: Session;

  @ManyToOne(() => Message, { nullable: true })
  parentMessage?: Message;

  @OneToMany(() => Message, (message) => message.parentMessage)
  replies = new Collection<Message>(this);

  @OneToMany(() => ToolCall, (toolCall) => toolCall.message)
  toolCalls = new Collection<ToolCall>(this);
}
