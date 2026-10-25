import { Opt } from '@mikro-orm/core';
import {
  Entity,
  Enum,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'crypto';
import { CommandApprovalMode } from '../../modules/settings/enums/command-approval-mode.js';

@Entity()
export class AgentSettings {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Enum({
    items: () => CommandApprovalMode,
    default: CommandApprovalMode.ASK_UNLESS_ALLOWLISTED,
  })
  commandApprovalMode: CommandApprovalMode & Opt =
    CommandApprovalMode.ASK_UNLESS_ALLOWLISTED;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
