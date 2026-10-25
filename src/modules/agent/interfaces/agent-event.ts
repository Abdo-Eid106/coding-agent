import { SessionStatus } from '../../sessions/enum/session.status.js';

export enum AgentEventEnum {
  DONE = 'done',
  TOKEN = 'token',
  INTERRUPT = 'interrupt',
  TOOL_START = 'tool-started',
  TOOL_END = 'tool-finished',
  TOOL_ERROR = 'tool-error',
  ERROR = 'error',
  SESSION_STATUS = 'session_status',
}

interface Context {
  messageId?: string;
  sessionId?: string;
}

export interface AgentEvent {
  type: AgentEventEnum;
  context: Context;
  data: unknown;
}

export interface ToolCallEvent extends AgentEvent {
  type:
    | AgentEventEnum.TOOL_START
    | AgentEventEnum.TOOL_END
    | AgentEventEnum.TOOL_ERROR;
  data: {
    id: string;
    toolCallId: string;
    name: string;
    input?: object;
    output?: object;
    error?: object;
    startedAt?: Date;
    finishedAt?: Date;
  };
}

export interface TokenEvent extends AgentEvent {
  type: AgentEventEnum.TOKEN;
  data: {
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

export interface InterruptEvent extends AgentEvent {
  type: AgentEventEnum.INTERRUPT;
  data: Interrupt;
}

export interface ErrorEvent extends AgentEvent {
  type: AgentEventEnum.ERROR;
  data: {
    message: string;
  };
}

export interface SessionEvent extends AgentEvent {
  type: AgentEventEnum.SESSION_STATUS;
  data: {
    status: SessionStatus;
  };
}

export interface DoneEvent extends AgentEvent {
  type: AgentEventEnum.DONE;
  data: null;
}
