import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { Provider } from "./provider.entity.js";

@Entity()
export class AIModel {
  @PrimaryKey({ type: "varchar" })
  id: string;

  @Property({ type: "varchar" })
  name: string;

  @Property({ nullable: true, type: "int" })
  contextWindow?: number;

  @Property({ nullable: true, type: "int" })
  defaultMaxTokens?: number;

  @Property({ default: false, type: "boolean" })
  supportsAttachments: boolean = false;

  @Index()
  @ManyToOne(() => Provider, { deleteRule: "cascade" })
  provider: Provider;
}
