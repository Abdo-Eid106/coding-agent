export enum AgentEventEnum {
  DONE = 'done',
  TOKEN = 'token',
  INTERRUPT = 'interrupt',
  TOOL_START = 'tool-started',
  TOOL_END = 'tool-finished',
}

export interface AgentStreamEvent {
  type: AgentEventEnum;
  sessionId: string;
  messageId: string;
  replyId?: string;
  payload: unknown;
}

export interface ToolCallEvent extends AgentStreamEvent {
  payload: {
    id: string;
    name: string;
    input?: object;
    output?: object;
  };
}
