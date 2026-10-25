import {
  ProtocolEvent,
  StreamChannel,
  ToolsEventData,
} from '@langchain/langgraph';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AgentEventEnum,
  ErrorEvent,
  ToolCallEvent,
} from '../../../interfaces/agent-event.js';
import { AppEvent } from '../../../enums/app-events.enum.js';
import {
  ToolErrorData,
  ToolFinishedData,
  ToolStartedData,
} from '@langchain/protocol';
import { ToolCall } from '../../../../../database/entities/tool-call.entity.js';

type ToolProjection = StreamChannel<
  ToolStartedData | ToolFinishedData | ToolErrorData
>;

function isInterruptErrorMessage(message: string): boolean {
  try {
    const parsed = JSON.parse(message);
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (item) => typeof item === 'object' && item !== null && 'value' in item,
      )
    );
  } catch {
    return false;
  }
}

export const toolEventsTransformer = () => {
  const channel = new StreamChannel<
    ToolStartedData | ToolFinishedData | ToolErrorData
  >('tools');

  return {
    init: () => ({ tools: channel }),
    process(event: ProtocolEvent) {
      if (event.method === 'tools') {
        const data = event.params.data as ToolsEventData;
        if (data.event === 'tool-error') {
          // Ignore interrupt breakpoints
          if (isInterruptErrorMessage(data.message)) {
            return true;
          }
        }

        if (
          data.event === 'tool-started' ||
          data.event === 'tool-finished' ||
          data.event === 'tool-error'
        ) {
          channel.push(data);
        }
      }

      return true;
    },
  };
};

interface ToolProjectionContext {
  messageId: string;
  sessionId: string;
}

@Injectable()
export class ToolsProjectionHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  execute(
    ctx: ToolProjectionContext,
    projection: ToolProjection,
  ): Promise<void> {
    return this.withErrorHandling(async () => {
      for await (const data of projection) {
        data.event == AgentEventEnum.TOOL_START
          ? await this.handleToolCallStarted(ctx, data)
          : data.event == AgentEventEnum.TOOL_END
            ? await this.handleToolCallFinished(ctx, data)
            : await this.handleToolCallError(ctx, data);
      }
    });
  }

  async handleToolCallStarted(
    ctx: ToolProjectionContext,
    data: ToolStartedData,
  ) {
    const event: ToolCallEvent = {
      type: AgentEventEnum.TOOL_START,
      context: ctx,
      data: {
        id: 'dummy',
        toolCallId: data.tool_call_id,
        name: data.tool_name,
        input: this.parseIfJson(data.input),
        startedAt: new Date(),
      },
    };

    let toolCall = await this.em.findOne(ToolCall, {
      toolCallId: event.data.toolCallId,
    });
    if (!toolCall) {
      const { id, ...rest } = event.data;
      toolCall = this.em.create(ToolCall, {
        ...rest,
        message: ctx.messageId,
      });
    }

    event.data.id = toolCall.id;
    this.eventEmitter.emit(AppEvent.AGENT_EVENT, event);

    await this.em.flush();
  }

  async handleToolCallFinished(
    ctx: ToolProjectionContext,
    data: ToolFinishedData,
  ) {
    const event: ToolCallEvent = {
      type: AgentEventEnum.TOOL_END,
      context: ctx,
      data: {
        id: 'dummy',
        toolCallId: data.tool_call_id,
        name: data.tool_name,
        output: this.parseIfJson(data.output?.lc_kwargs?.content),
        finishedAt: new Date(),
      },
    };

    const toolCall = await this.em.findOne(ToolCall, {
      toolCallId: event.data.toolCallId,
    });
    if (!toolCall) return;

    this.em.assign(toolCall, {
      output: event.data.output,
      finishedAt: new Date(),
    });

    event.data.id = toolCall.id;
    this.eventEmitter.emit(AppEvent.AGENT_EVENT, event);

    await this.em.flush();
  }

  async handleToolCallError(ctx: ToolProjectionContext, data: ToolErrorData) {
    const event: ToolCallEvent = {
      type: AgentEventEnum.TOOL_ERROR,
      context: ctx,
      data: {
        id: 'dummy',
        toolCallId: data.tool_call_id,
        name: data.tool_name,
        error: { message: data.message },
        finishedAt: new Date(),
      },
    };

    const toolCall = await this.em.findOne(ToolCall, {
      toolCallId: event.data.toolCallId,
    });
    if (!toolCall) return;

    this.em.assign(toolCall, {
      error: event.data.error,
      finishedAt: new Date(),
    });

    event.data.id = toolCall.id;
    this.eventEmitter.emit(AppEvent.AGENT_EVENT, event);

    await this.em.flush();
  }

  private parseIfJson(value: unknown) {
    try {
      return JSON.parse(value as any);
    } catch {
      return value;
    }
  }

  private async withErrorHandling(
    operation: () => Promise<void>,
  ): Promise<void> {
    try {
      await operation();
    } catch (error: unknown) {
      if (this.isAbortError(error)) return;

      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      const event: ErrorEvent = {
        type: AgentEventEnum.ERROR,
        context: {},
        data: { message },
      };

      this.eventEmitter.emit(AppEvent.AGENT_EVENT, event);
    }
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'APIUserAbortError')
    );
  }
}
