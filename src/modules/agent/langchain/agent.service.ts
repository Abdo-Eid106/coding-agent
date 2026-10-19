import { HumanMessage } from '@langchain/core/messages';
import { Command } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';

import {
  AgentGraphFactory,
  type AgentGraph,
  type GraphInput,
  type AgentGraphContext,
} from './agent-graph.factory.js';

import {
  AgentStreamEvent,
  AgentEventEnum,
  ToolCallEvent,
} from '../interfaces/agent-stream-event.js';
import { toolEventsTransformer } from './tool-event-transformer.js';

interface RunAgentDto {
  threadId: string;
  context: AgentGraphContext;
  message: string;
  workingDirectory?: string;
}

interface ResumeAgentDto {
  threadId: string;
  context: AgentGraphContext;
  interruptId: string;
  payload: object;
}

@Injectable()
export class AgentService {
  private readonly graph: AgentGraph;

  constructor(private readonly graphFactory: AgentGraphFactory) {
    this.graph = graphFactory.create();
  }

  async *run(dto: RunAgentDto): AsyncGenerator<AgentStreamEvent> {
    const input: GraphInput = {
      messages: [new HumanMessage(dto.message)],
      workingDirectory: dto.workingDirectory,
    };

    yield* this.stream(input, dto.threadId, dto.context);
  }

  async *resume(dto: ResumeAgentDto): AsyncGenerator<AgentStreamEvent> {
    const input: GraphInput = new Command({
      resume: { [dto.interruptId]: dto.payload },
    });

    yield* this.stream(input, dto.threadId, dto.context);
  }

  private async *stream(
    input: GraphInput,
    threadId: string,
    context: AgentGraphContext,
  ): AsyncGenerator<AgentStreamEvent> {
    const stream = await this.graph.streamEvents(input, {
      configurable: { thread_id: threadId },
      context,
      version: 'v3',
      transformers: [toolEventsTransformer],
    });

    for await (const event of stream.extensions.tools) {
      yield {
        type: event.event as AgentEventEnum,
        sessionId: threadId,
        messageId: context.messageId,
        payload: {
          id: event.tool_call_id,
          name: event.tool_name,
          input: event.input,
          output: event?.output?.lc_kwargs?.content,
        },
      };
    }

    for await (const message of stream.messages) {
      for await (const token of message.text) {
        yield {
          type: AgentEventEnum.TOKEN,
          sessionId: threadId,
          messageId: context.messageId,
          payload: token,
        };
      }
    }

    if (stream.interrupted) {
      yield {
        type: AgentEventEnum.INTERRUPT,
        sessionId: threadId,
        messageId: context.messageId,
        payload: stream.interrupts[0],
      };

      return;
    }

    yield {
      type: AgentEventEnum.DONE,
      sessionId: threadId,
      messageId: context.messageId,
      payload: null,
    };
  }
}
