import {
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { randomUUID } from "node:crypto";
import { Session } from "./session.entity.js";
import { Collection } from "@mikro-orm/core";

@Entity()
export class Project {
  @PrimaryKey({ type: "uuid" })
  id: string = randomUUID();

  @Property({ type: "varchar" })
  name: string;

  @Property({ type: "varchar" })
  path: string;

  @OneToMany(() => Session, (session) => session.project)
  sessions = new Collection<Session>(this);
}
