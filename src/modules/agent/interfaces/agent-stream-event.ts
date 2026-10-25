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
  payload: unknown;
}

export interface ToolCallEvent extends AgentStreamEvent {
  payload: {
    id: string;
    toolCallId: string;
    name: string;
    input?: object;
    output?: object;
    startedAt?: Date;
    finishedAt?: Date;
  };
}

export interface TokenEvent extends AgentStreamEvent {
  payload: {
    replyId: string;
    token: string;
  };
}

export interface Interrupt {
  interruptId: string;
  payload: {
    message: string;
    options: { id: string; label: string }[];
  };
}

export interface InterruptEvent extends AgentStreamEvent {
  payload: Interrupt;
}
