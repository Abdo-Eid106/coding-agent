import { Collection, type Opt } from "@mikro-orm/core";
import {
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { AIModel } from "./ai-model.entity.js";

@Entity()
export class Provider {
  @PrimaryKey({ type: "varchar" })
  id: string;

  @Property({ type: "varchar", unique: true })
  name: string;

  @Property({ type: "varchar", nullable: true })
  apiKey?: string & Opt;

  @Property({ type: "varchar", nullable: true })
  baseUrl?: string & Opt;

  @OneToMany(() => AIModel, (model) => model.provider)
  models = new Collection<AIModel>(this);
}
