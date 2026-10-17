import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { randomUUIDv7 } from "node:crypto";
import { Session } from "./session.entity.js";
import type { Opt } from "@mikro-orm/core";

export enum MessageRole {
  USER = "user",
  AI = "ai",
}

@Entity()
@Index({ properties: ["session", "createdAt"] })
export class Message {
  @PrimaryKey({ type: "uuid" })
  id: string = randomUUIDv7();

  @Property({ type: "varchar" })
  content: string;

  @Enum(() => MessageRole)
  role: MessageRole;

  @Property()
  createdAt: Date & Opt = new Date();

  @ManyToOne(() => Session, { deleteRule: "cascade" })
  session: Session;
}
