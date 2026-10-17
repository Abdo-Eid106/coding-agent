import { Module } from '@nestjs/common';
import { ToolManager } from './providers/tool-manager.js';
import { AgentService } from './providers/agent.service.js';
import { AgentEventsHandler } from './providers/agent.event-handler.js';
import { PrepareAgentRun } from './providers/prepare-agent-run.js';
import { AgentGraphFactory } from './providers/agent-graph.factory.js';

@Module({
  providers: [
    ToolManager,
    AgentService,
    AgentGraphFactory,
    AgentEventsHandler,
    PrepareAgentRun,
  ],
  exports: [AgentService],
})
export class AgentModule {}
