import { Module } from '@nestjs/common';
import { ToolManager } from './providers/tool-manager.js';
import { AgentService } from './langchain/agent.service.js';
import { AgentEventsHandler } from './providers/agent.event-handler.js';
import { AgentGraphFactory } from './langchain/agent-graph.factory.js';
import { AgentExecutionService } from './providers/agent-execution.service.js';

@Module({
  providers: [
    ToolManager,
    AgentService,
    AgentGraphFactory,
    AgentEventsHandler,
    AgentExecutionService,
  ],
  exports: [AgentService],
})
export class AgentModule {}
