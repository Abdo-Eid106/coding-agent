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
  ToolCallEvent,
} from '../../interfaces/agent-stream-event.js';
import { AppEvent } from '../../../events/enums/app-events.enum.js';
import { ToolFinishedData, ToolStartedData } from '@langchain/protocol';
import { ToolCall } from '../../../../database/entities/tool-call.entity.js';

type ToolProjection = StreamChannel<ToolStartedData | ToolFinishedData>;

export const toolEventsTransformer = () => {
  const channel = new StreamChannel<ToolStartedData | ToolFinishedData>(
    'tools',
  );

  return {
    init: () => ({ tools: channel }),
    process(event: ProtocolEvent) {
      if (event.method === 'tools') {
        const data = event.params.data as ToolsEventData;

        if (data.event === 'tool-started' || data.event === 'tool-finished') {
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
          : await this.handleToolCallFinished(ctx, data);
      }
    });
  }

  async handleToolCallStarted(
    ctx: ToolProjectionContext,
    data: ToolStartedData,
  ) {
    const event: ToolCallEvent = {
      type: AgentEventEnum.TOOL_START,
      sessionId: ctx.sessionId,
      messageId: ctx.messageId,
      payload: {
        id: 'dummy',
        toolCallId: data.tool_call_id,
        name: data.tool_name,
        input: this.parseIfJson(data.input),
        startedAt: new Date(),
      },
    };

    let toolCall = await this.em.findOne(ToolCall, {
      toolCallId: event.payload.toolCallId,
    });
    if (!toolCall) {
      const { id, ...rest } = event.payload;
      toolCall = this.em.create(ToolCall, {
        ...rest,
        message: ctx.messageId,
      });
    }

    event.payload.id = toolCall.id;
    this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);

    await this.em.flush();
  }

  async handleToolCallFinished(
    ctx: ToolProjectionContext,
    data: ToolFinishedData,
  ) {
    const event: ToolCallEvent = {
      type: AgentEventEnum.TOOL_END,
      sessionId: ctx.sessionId,
      messageId: ctx.messageId,
      payload: {
        id: 'dummy',
        toolCallId: data.tool_call_id,
        name: data.tool_name,
        output: this.parseIfJson(data.output?.lc_kwargs?.content),
        finishedAt: new Date(),
      },
    };

    const toolCall = await this.em.findOne(ToolCall, {
      toolCallId: event.payload.toolCallId,
    });
    if (!toolCall) return;

    this.em.assign(toolCall, {
      output: event.payload.output,
      finishedAt: new Date(),
    });

    event.payload.id = toolCall.id;
    this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);

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

      console.log('error = ', error);
      this.eventEmitter.emit(AppEvent.AGENT_STREAM_ERROR, {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'APIUserAbortError')
    );
  }
}
