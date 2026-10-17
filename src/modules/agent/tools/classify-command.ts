import { ALLOWED_COMMANDS } from "./constants/allowed-commands.js";
import { DENIED_COMMANDS } from "./constants/denied-commands.js";

export enum CommandDecision {
  ALLOW = "allow",
  ASK = "ask",
  DENY = "deny",
}

export function classifyCommand(command: string): CommandDecision {
  const normalized = command.trim();
  if (!normalized) return CommandDecision.DENY;

  const executable = normalized.split(/\s+/)[0];
  if (!executable) return CommandDecision.DENY;

  if (DENIED_COMMANDS.has(executable)) return CommandDecision.DENY;
  if (ALLOWED_COMMANDS.has(executable)) return CommandDecision.ALLOW;

  return CommandDecision.ASK;
}
