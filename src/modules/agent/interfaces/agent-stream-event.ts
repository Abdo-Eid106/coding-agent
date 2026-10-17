export enum AgentEventEnum {
  DONE = 'done',
  TOKEN = 'token',
  INTERRUPT = 'interrupt',
}

export interface AgentStreamEvent {
  type: AgentEventEnum;
  sessionId: string;
  messageId: string;
  payload: unknown;
}
