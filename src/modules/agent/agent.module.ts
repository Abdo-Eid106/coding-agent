import { Module } from '@nestjs/common';
import { ToolManager } from './providers/tool-manager.js';
import { AgentService } from './providers/agent-service/agent.service.js';
import { AgentEventsHandler } from './providers/agent.event-handler.js';
import { AgentGraphFactory } from './providers/agent-service/agent-graph.factory.js';
import { MessagesProjectionHandler } from './providers/agent-service/projections/messages-projection-handler.js';
import { ToolsProjectionHandler } from './providers/agent-service/projections/tools-projection-handler.js';
import { StreamCompletionHandler } from './providers/agent-service/projections/stream-completion-handler.js';
import { SessionModule } from '../sessions/sessions.module.js';
import { AgentConroller } from './agent.controller.js';
import { McpService } from './providers/mcp.service.js';

@Module({
  imports: [SessionModule],
  providers: [
    McpService,
    ToolManager,
    AgentService,
    AgentGraphFactory,
    AgentEventsHandler,
    MessagesProjectionHandler,
    ToolsProjectionHandler,
    StreamCompletionHandler,
  ],
  controllers: [AgentConroller],
  exports: [AgentService],
})
export class AgentModule {}
