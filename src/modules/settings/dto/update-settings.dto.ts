import { IsIn } from 'class-validator';
import { CommandApprovalMode } from '../enums/command-approval-mode.js';

export class UpdateSettingsDto {
  @IsIn(Object.values(CommandApprovalMode))
  commandApprovalMode: CommandApprovalMode;
}
