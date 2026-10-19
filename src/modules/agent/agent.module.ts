import { Module } from '@nestjs/common';
import { ToolManager } from './providers/tool-manager.js';
import { AgentService } from './langchain/agent.service.js';
import { AgentEventsHandler } from './providers/agent.event-handler.js';
import { AgentGraphFactory } from './langchain/agent-graph.factory.js';
import { MessagesProjectionHandler } from './langchain/projections/messages-projection-handler.js';
import { ToolsProjectionHandler } from './langchain/projections/tools-projection-handler.js';
import { StreamCompletionHandler } from './langchain/projections/stream-completion-handler.js';

@Module({
  providers: [
    ToolManager,
    AgentService,
    AgentGraphFactory,
    AgentEventsHandler,
    MessagesProjectionHandler,
    ToolsProjectionHandler,
    StreamCompletionHandler,
  ],
  exports: [AgentService],
})
export class AgentModule {}
