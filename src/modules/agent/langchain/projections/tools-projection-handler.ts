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
        const event = this.constructEvent(ctx, data);

        if (event.type == AgentEventEnum.TOOL_START) {
          const toolCall = this.em.create(ToolCall, {
            name: event.payload.name,
            toolCallId: event.payload.toolCallId,
            input: event.payload.input,
            message: event.messageId,
          });
          event.payload.id = toolCall.id;
        } else {
          const toolCall = await this.em.findOne(ToolCall, {
            toolCallId: event.payload.toolCallId,
          });
          if (!toolCall) return;
          toolCall.output = event.payload.output;
          event.payload.id = toolCall.id;
          toolCall.finishedAt = new Date();
        }
        await this.em.flush();

        this.eventEmitter.emit(AppEvent.AGENT_STREAM_EVENT, event);
      }
    });
  }

  private constructEvent(
    ctx: ToolProjectionContext,
    data: ToolStartedData | ToolFinishedData,
  ): ToolCallEvent {
    const base = { toolCallId: data.tool_call_id, name: data.tool_name };

    const event: ToolCallEvent =
      data.event === 'tool-started'
        ? {
            type: AgentEventEnum.TOOL_START,
            sessionId: ctx.sessionId,
            messageId: ctx.messageId,
            payload: {
              ...base,
              input: this.parseIfJson(data.input),
              startedAt: new Date(),
            },
          }
        : {
            type: AgentEventEnum.TOOL_END,
            sessionId: ctx.sessionId,
            messageId: ctx.messageId,
            payload: {
              ...base,
              output: this.parseIfJson(data.output?.lc_kwargs?.content),
              finishedAt: new Date(),
            },
          };

    return event;
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
      console.log('error = ', error);
      this.eventEmitter.emit(AppEvent.AGENT_STREAM_ERROR, {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }
}
