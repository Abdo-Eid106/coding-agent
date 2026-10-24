import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { Provider } from './provider.entity.js';

@Entity()
export class AIModel {
  @PrimaryKey({ type: 'varchar' })
  id: string;

  @Property({ type: 'varchar' })
  displayName: string;

  @Index()
  @ManyToOne(() => Provider, { deleteRule: 'cascade' })
  provider: Provider;
}
