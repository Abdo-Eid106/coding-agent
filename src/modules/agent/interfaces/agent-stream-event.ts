export enum AgentEventEnum {
  DONE = 'done',
  TOKEN = 'token',
  INTERRUPT = 'interrupt',
}

export interface AgentStreamEvent {
  type: AgentEventEnum;
  sessionId: string;
  messageId: string;
  replyId?: string;
  payload: unknown;
}
