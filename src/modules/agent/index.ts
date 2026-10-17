import { AIMessage } from "@langchain/core/messages";
import {
  END,
  MessagesValue,
  START,
  StateGraph,
  StateSchema,
  MemorySaver,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SYSTEM_PROMPT } from "./create-model.js";
import z from "zod";

import { createModel } from "./create-model.js";
import { toolManager } from "./tool-manager.js";

const State = new StateSchema({
  messages: MessagesValue,
  model: z.string(),
  sessionId: z.string(),
  modelId: z.string(),
});

const Context = z.object({
  provider: z.string(),
  apiKey: z.string(),
  model: z.string(),
  baseUrl: z.string().default(""),
});

export const graph = new StateGraph(State, {
  context: Context,
})
  .addNode("agent", async (state, runtime) => {
    const { provider, apiKey, model, baseUrl } = runtime.context!;

    const tools = await toolManager.getTools();
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
  .addNode("tools", async (state, config) => {
    const tools = await toolManager.getTools();
    const toolNode = new ToolNode(tools);

    return toolNode.invoke({ messages: state.messages }, config);
  })
  .addEdge(START, "agent")
  .addConditionalEdges(
    "agent",
    (state) => {
      const lastMessage = state.messages.at(-1);
      if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
        return "tools";
      }
      return END;
    },
    {
      tools: "tools",
      [END]: END,
    },
  )
  .addEdge("tools", "agent")
  .compile({ checkpointer: new MemorySaver() });
