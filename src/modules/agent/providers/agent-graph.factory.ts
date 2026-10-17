import { AIMessage } from '@langchain/core/messages';
import {
  END,
  MessagesValue,
  START,
  StateGraph,
  StateSchema,
  MemorySaver,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { Injectable } from '@nestjs/common';
import z from 'zod';

import { SYSTEM_PROMPT, createModel } from '../helpers/create-model.js';
import { ToolManager } from './tool-manager.js';

const State = new StateSchema({
  messages: MessagesValue,
  model: z.string(),
  sessionId: z.string(),
  modelId: z.string(),
});

export const AgentContext = z.object({
  modelConfig: z.object({
    provider: z.string(),
    apiKey: z.string(),
    model: z.string(),
    baseUrl: z.string().default(''),
  }),
  messageId: z.string(),
});

export type AgentGraphContext = z.infer<typeof AgentContext>;

@Injectable()
export class AgentGraphFactory {
  constructor(private readonly toolManager: ToolManager) {}

  create() {
    return new StateGraph(State, {
      context: AgentContext,
    })
      .addNode('agent', async (state, runtime) => {
        const { provider, apiKey, model, baseUrl } =
          runtime.context!.modelConfig;

        const tools = await this.toolManager.getTools();

        const modelWithTools = createModel({
          provider,
          apiKey,
          model,
          baseUrl,
        }).bindTools(tools);

        const response = await modelWithTools.invoke([
          SYSTEM_PROMPT,
          ...state.messages,
        ]);

        return { messages: [response] };
      })
      .addNode('tools', async (state, config) => {
        const tools = await this.toolManager.getTools();
        const toolNode = new ToolNode(tools);

        return toolNode.invoke({ messages: state.messages }, config);
      })
      .addEdge(START, 'agent')
      .addConditionalEdges(
        'agent',
        (state) => {
          const lastMessage = state.messages.at(-1);

          return lastMessage instanceof AIMessage &&
            lastMessage.tool_calls?.length
            ? 'tools'
            : END;
        },
        {
          tools: 'tools',
          [END]: END,
        },
      )
      .addEdge('tools', 'agent')
      .compile({
        checkpointer: new MemorySaver(),
      });
  }
}

export type AgentGraph = ReturnType<AgentGraphFactory['create']>;
export type GraphInput = Parameters<AgentGraph['streamEvents']>[0];
